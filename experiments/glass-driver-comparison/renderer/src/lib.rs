//! iOS 27 optical kernel with an optional browser adapter.
//! Disable default features to use the core without DOM, Wasm or graphics dependencies.
//!
//! The GLSL kernel ports Lenso's existing material and refraction equations.
//! Rounded rectangles use the same kernel in browser and native host adapters.

#[cfg(feature = "web")]
mod web;
#[cfg(feature = "web")]
pub use web::GlassRenderer;

/// Shared optical kernel; adapters provide the background sampler and lens records.
pub const FRAGMENT: &str = include_str!("../../../../packages/glass/shaders/ios27.frag");

/// The optical displacement before refraction-strength scaling, in geometry units.
/// Input `progress` is distance from the edge divided by bezel width.
#[must_use]
pub fn displacement(progress: f32, bezel: f32, thickness: f32) -> f32 {
    if progress >= 1.0 {
        return 0.0;
    }
    let t = progress.max(0.001);
    let surface = (1.0 - (1.0 - t).powi(4)).powf(0.25);
    let incident = ((1.0 - t).powi(3) / surface.powi(3)).atan();
    let refracted = (incident.sin() / 1.5).asin();
    (incident - refracted).tan() * (thickness + surface * bezel)
}

#[cfg(test)]
mod tests {
    use super::displacement;

    // A sign or scale regression bends content outward or changes with pixel density.
    #[test]
    fn refraction_has_neutral_centre_and_scales_with_geometry() {
        assert_eq!(displacement(1.0, 30.0, 24.0), 0.0);
        for t in [0.0, 0.1, 0.5, 0.9] {
            let a = displacement(t, 30.0, 24.0);
            assert!(a.is_finite() && a >= 0.0);
            assert!((displacement(t, 60.0, 48.0) - 2.0 * a).abs() < 0.001);
        }
        assert!(displacement(0.1, 30.0, 24.0) > displacement(0.9, 30.0, 24.0));
    }
}
