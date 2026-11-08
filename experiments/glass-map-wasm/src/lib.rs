//! Experimental displacement-map kernel; not linked into Lenso UI.
//! Adapted from Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
use std::cell::RefCell;

thread_local! { static PIXELS: RefCell<Vec<u8>> = const { RefCell::new(Vec::new()) }; }

/// Generate a 2x-density RGBA displacement field. Returns zero for invalid geometry.
#[unsafe(no_mangle)]
pub extern "C" fn generate(
    width: u32,
    height: u32,
    radius: f64,
    bezel: f64,
    thickness: f64,
    quarter: u32,
) -> u32 {
    if width == 0
        || height == 0
        || width > 1024
        || height > 1024
        || !radius.is_finite()
        || !bezel.is_finite()
        || !thickness.is_finite()
        || radius < 0.0
        || radius > f64::from(width.min(height)) / 2.0
        || bezel <= 0.0
        || thickness <= 0.0
    {
        return 0;
    }
    let mut samples = [0_f32; 128];
    let mut maximum = 0_f64;
    for (i, value) in samples.iter_mut().enumerate() {
        let t = (i as f64 / 127.0).max(0.001);
        let surface = (1.0 - (1.0 - t).powi(4)).powf(0.25);
        let incident = ((1.0 - t).powi(3) / surface.powi(3)).atan();
        let refracted = (incident.sin() / 1.5).asin();
        *value = ((incident - refracted).tan() * (thickness + surface * bezel)) as f32;
        maximum = maximum.max(f64::from(*value));
    }
    let cols = width * 2;
    let rows = height * 2;
    PIXELS.with_borrow_mut(|pixels| {
        pixels.resize((cols * rows * 4) as usize, 0);
        for y in 0..if quarter == 0 { rows } else { height } {
            for x in 0..if quarter == 0 { cols } else { width } {
                let px = (f64::from(x) + 0.5) / 2.0 - f64::from(width) / 2.0;
                let py = (f64::from(y) + 0.5) / 2.0 - f64::from(height) / 2.0;
                let qx = px.abs() - (f64::from(width) / 2.0 - radius);
                let qy = py.abs() - (f64::from(height) / 2.0 - radius);
                let ox = qx.max(0.0);
                let oy = qy.max(0.0);
                let length = ox.hypot(oy);
                let distance = radius - (length + qx.max(qy).min(0.0));
                let nx = if length > 0.0 {
                    ox / length * px.signum()
                } else if qx > qy {
                    px.signum()
                } else {
                    0.0
                };
                let ny = if length > 0.0 {
                    oy / length * py.signum()
                } else if qx > qy {
                    0.0
                } else {
                    py.signum()
                };
                let shift = if distance >= 0.0 && distance < bezel {
                    let at = distance / bezel * 127.0;
                    let low = at.floor() as usize;
                    let a = f64::from(samples[low]);
                    let b = f64::from(samples[(low + 1).min(127)]);
                    a + (b - a) * (at - low as f64)
                } else {
                    0.0
                };
                let r = -nx * shift / maximum * 127.5;
                let g = -ny * shift / maximum * 127.5;
                let mut write = |x, y, r: f64, g: f64| {
                    let at = ((y * cols + x) * 4) as usize;
                    pixels[at] = (127.5 + r).round() as u8;
                    pixels[at + 1] = (127.5 + g).round() as u8;
                    pixels[at + 2] = 128;
                    pixels[at + 3] = 255;
                };
                write(x, y, r, g);
                if quarter != 0 {
                    write(cols - 1 - x, y, -r, g);
                    write(x, rows - 1 - y, r, -g);
                    write(cols - 1 - x, rows - 1 - y, -r, -g);
                }
            }
        }
        pixels.len() as u32
    })
}

/// Address of the last field. Valid until the next generate call on this thread.
#[unsafe(no_mangle)]
pub extern "C" fn pixels_ptr() -> *const u8 {
    PIXELS.with_borrow(|pixels| pixels.as_ptr())
}

#[cfg(test)]
mod tests {
    use super::generate;
    #[test]
    fn invalid_geometry_does_not_allocate() {
        assert_eq!(generate(0, 50, 25.0, 30.0, 10.0, 0), 0);
        assert_eq!(generate(83, 50, f64::NAN, 30.0, 10.0, 0), 0);
        assert_eq!(generate(u32::MAX, 50, 25.0, 30.0, 10.0, 0), 0);
        assert_eq!(generate(83, 50, 25.0, 0.0, 10.0, 0), 0);
        assert_eq!(generate(83, 50, 25.0, 30.0, 10.0, 0), 83 * 50 * 16);
    }
}
