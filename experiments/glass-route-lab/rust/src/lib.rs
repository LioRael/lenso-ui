//! Experimental retained glass renderer using the browser's WebGL2 implementation.

use wasm_bindgen::{JsCast, prelude::*};
use web_sys::{
    HtmlCanvasElement, HtmlVideoElement, WebGl2RenderingContext as Gl, WebGlBuffer,
    WebGlFramebuffer, WebGlProgram, WebGlShader, WebGlTexture, WebGlUniformLocation,
    WebGlVertexArrayObject,
};

const VERTEX: &str = include_str!("../../shaders/quad.vert");
const BLUR: &str = include_str!("../../shaders/blur.frag");
const GLASS: &str = include_str!("../../shaders/glass.frag");
const LENS_STRIDE: usize = 8;

fn error(message: &str) -> JsValue {
    JsValue::from_str(message)
}

fn validate_lenses(values: &[f32]) -> Result<i32, &'static str> {
    if values.is_empty() || !values.len().is_multiple_of(LENS_STRIDE) {
        return Err("lens records require eight values each");
    }
    if values.len() > LENS_STRIDE * 1000 || values.iter().any(|value| !value.is_finite()) {
        return Err("invalid lens capacity or non-finite coordinate");
    }
    for lens in values.as_chunks::<LENS_STRIDE>().0 {
        if lens[2] <= 0. || lens[3] <= 0. || lens[4] <= 0. || lens[5] <= 0. {
            return Err("lens dimensions, radius and bezel must be positive");
        }
    }
    Ok((values.len() / LENS_STRIDE) as i32)
}

fn shader(gl: &Gl, kind: u32, source: &str) -> Result<WebGlShader, JsValue> {
    let shader = gl
        .create_shader(kind)
        .ok_or_else(|| error("shader allocation failed"))?;
    gl.shader_source(&shader, source);
    gl.compile_shader(&shader);
    if gl
        .get_shader_parameter(&shader, Gl::COMPILE_STATUS)
        .as_bool()
        == Some(true)
    {
        Ok(shader)
    } else {
        let message = gl.get_shader_info_log(&shader).unwrap_or_default();
        gl.delete_shader(Some(&shader));
        Err(error(&message))
    }
}

#[derive(Debug)]
struct Program {
    handle: WebGlProgram,
    full: Option<WebGlUniformLocation>,
    step: Option<WebGlUniformLocation>,
}

impl Program {
    fn new(
        gl: &Gl,
        fragment: &str,
        width: i32,
        height: i32,
        material: &[f32],
    ) -> Result<Self, JsValue> {
        let vertex = shader(gl, Gl::VERTEX_SHADER, VERTEX)?;
        let pixel = match shader(gl, Gl::FRAGMENT_SHADER, fragment) {
            Ok(pixel) => pixel,
            Err(err) => {
                gl.delete_shader(Some(&vertex));
                return Err(err);
            }
        };
        let handle = gl
            .create_program()
            .ok_or_else(|| error("program allocation failed"))?;
        gl.attach_shader(&handle, &vertex);
        gl.attach_shader(&handle, &pixel);
        gl.link_program(&handle);
        gl.delete_shader(Some(&vertex));
        gl.delete_shader(Some(&pixel));
        if gl.get_program_parameter(&handle, Gl::LINK_STATUS).as_bool() != Some(true) {
            let message = gl.get_program_info_log(&handle).unwrap_or_default();
            gl.delete_program(Some(&handle));
            return Err(error(&message));
        }
        gl.use_program(Some(&handle));
        gl.uniform2f(
            gl.get_uniform_location(&handle, "size").as_ref(),
            width as f32,
            height as f32,
        );
        gl.uniform1i(gl.get_uniform_location(&handle, "source").as_ref(), 0);
        let blur = match (material[0] == 26., material[2] == 1.) {
            (true, true) => 6.,
            (false, true) => 8.,
            (true, false) => 3.5,
            (false, false) => 3.,
        };
        gl.uniform1f(
            gl.get_uniform_location(&handle, "sigma").as_ref(),
            blur * material[3],
        );
        gl.uniform4fv_with_f32_array(
            gl.get_uniform_location(&handle, "material").as_ref(),
            material,
        );
        Ok(Self {
            full: gl.get_uniform_location(&handle, "full"),
            step: gl.get_uniform_location(&handle, "stepSize"),
            handle,
        })
    }
}

/// Owns shader programs, reusable framebuffers, textures and an instanced lens batch.
#[wasm_bindgen]
#[derive(Debug)]
pub struct GlassRenderer {
    gl: Gl,
    blur: Program,
    glass: Program,
    textures: Vec<WebGlTexture>,
    frames: Vec<WebGlFramebuffer>,
    vertices: WebGlVertexArrayObject,
    lenses: WebGlBuffer,
    width: i32,
    height: i32,
    count: i32,
    revision: Option<u32>,
}

#[wasm_bindgen]
impl GlassRenderer {
    /// Creates a renderer for a fixed-size experimental scene and material.
    ///
    /// # Errors
    /// Returns an error for invalid parameters, unavailable WebGL2 or failed GPU allocation.
    #[wasm_bindgen(constructor)]
    pub fn new(canvas: &HtmlCanvasElement, material: &[f32]) -> Result<Self, JsValue> {
        Self::with_fragment(canvas, material, GLASS)
    }

    /// Creates an experimental renderer with an explicitly supplied optical kernel.
    ///
    /// # Errors
    /// Returns parameter, browser allocation or shader compilation errors.
    pub fn with_fragment(
        canvas: &HtmlCanvasElement,
        material: &[f32],
        fragment: &str,
    ) -> Result<Self, JsValue> {
        if material.len() != 4 || material.iter().any(|v| !v.is_finite()) || material[3] <= 0. {
            return Err(error(
                "material requires version, appearance, profile and positive DPR",
            ));
        }
        let gl: Gl = canvas
            .get_context("webgl2")?
            .ok_or_else(|| error("WebGL2 unavailable"))?
            .dyn_into()?;
        let width = i32::try_from(canvas.width()).map_err(|_| error("width overflow"))?;
        let height = i32::try_from(canvas.height()).map_err(|_| error("height overflow"))?;
        if width <= 0 || height <= 0 {
            return Err(error("empty canvas"));
        }
        let blur = Program::new(&gl, BLUR, width, height, material)?;
        let glass = Program::new(&gl, fragment, width, height, material)?;
        let vertices = gl
            .create_vertex_array()
            .ok_or_else(|| error("vertex array allocation failed"))?;
        let lenses = gl
            .create_buffer()
            .ok_or_else(|| error("lens buffer allocation failed"))?;
        gl.bind_vertex_array(Some(&vertices));
        gl.bind_buffer(Gl::ARRAY_BUFFER, Some(&lenses));
        gl.buffer_data_with_i32(
            Gl::ARRAY_BUFFER,
            (1000 * LENS_STRIDE * 4) as i32,
            Gl::DYNAMIC_DRAW,
        );
        for index in 0..2 {
            gl.enable_vertex_attrib_array(index);
            gl.vertex_attrib_pointer_with_i32(index, 4, Gl::FLOAT, false, 32, index as i32 * 16);
            gl.vertex_attrib_divisor(index, 1);
        }
        let mut renderer = Self {
            gl,
            blur,
            glass,
            textures: Vec::new(),
            frames: Vec::new(),
            vertices,
            lenses,
            width,
            height,
            count: 0,
            revision: None,
        };
        for index in 0..3 {
            let texture = renderer
                .gl
                .create_texture()
                .ok_or_else(|| error("texture allocation failed"))?;
            renderer.gl.bind_texture(Gl::TEXTURE_2D, Some(&texture));
            renderer.textures.push(texture);
            for (key, value) in [
                (Gl::TEXTURE_MIN_FILTER, Gl::LINEAR),
                (Gl::TEXTURE_MAG_FILTER, Gl::LINEAR),
                (Gl::TEXTURE_WRAP_S, Gl::CLAMP_TO_EDGE),
                (Gl::TEXTURE_WRAP_T, Gl::CLAMP_TO_EDGE),
            ] {
                renderer
                    .gl
                    .tex_parameteri(Gl::TEXTURE_2D, key, value as i32);
            }
            renderer
                .gl
                .tex_image_2d_with_i32_and_i32_and_i32_and_format_and_type_and_opt_u8_array(
                    Gl::TEXTURE_2D,
                    0,
                    Gl::RGBA8 as i32,
                    width,
                    height,
                    0,
                    Gl::RGBA,
                    Gl::UNSIGNED_BYTE,
                    None,
                )?;
            if index > 0 {
                let frame = renderer
                    .gl
                    .create_framebuffer()
                    .ok_or_else(|| error("framebuffer allocation failed"))?;
                renderer.gl.bind_framebuffer(Gl::FRAMEBUFFER, Some(&frame));
                renderer.gl.framebuffer_texture_2d(
                    Gl::FRAMEBUFFER,
                    Gl::COLOR_ATTACHMENT0,
                    Gl::TEXTURE_2D,
                    renderer.textures.last(),
                    0,
                );
                renderer.frames.push(frame);
                if renderer.gl.check_framebuffer_status(Gl::FRAMEBUFFER) != Gl::FRAMEBUFFER_COMPLETE
                {
                    return Err(error("incomplete framebuffer"));
                }
            }
        }
        renderer.gl.pixel_storei(Gl::UNPACK_FLIP_Y_WEBGL, 1);
        renderer.gl.viewport(0, 0, width, height);
        Ok(renderer)
    }

    /// Replaces the retained lens batch without reallocating its GPU buffer.
    ///
    /// # Errors
    /// Rejects incomplete records, invalid geometry and batches exceeding 1,000 lenses.
    pub fn set_lenses(&mut self, values: &[f32]) -> Result<(), JsValue> {
        self.count = validate_lenses(values).map_err(error)?;
        self.gl.bind_buffer(Gl::ARRAY_BUFFER, Some(&self.lenses));
        // This copy happens when the retained lens batch changes.
        self.gl.buffer_sub_data_with_i32_and_array_buffer_view(
            Gl::ARRAY_BUFFER,
            0,
            &js_sys::Float32Array::from(values),
        );
        Ok(())
    }

    /// Uploads changed canvas content, reuses its blur, and renders the lens batch.
    ///
    /// # Errors
    /// Returns the browser's texture upload error, including origin restrictions.
    pub fn render_canvas(
        &mut self,
        source: &HtmlCanvasElement,
        revision: u32,
    ) -> Result<(), JsValue> {
        if self.revision != Some(revision) {
            self.gl
                .bind_texture(Gl::TEXTURE_2D, Some(&self.textures[0]));
            self.gl
                .tex_sub_image_2d_with_u32_and_u32_and_html_canvas_element(
                    Gl::TEXTURE_2D,
                    0,
                    0,
                    0,
                    Gl::RGBA,
                    Gl::UNSIGNED_BYTE,
                    source,
                )?;
            self.blur_source();
            self.revision = Some(revision);
        }
        self.draw();
        Ok(())
    }

    /// Samples a playing video directly, with one shared upload for all lenses.
    ///
    /// # Errors
    /// Returns the browser's texture upload error for unavailable or restricted media.
    pub fn render_video(
        &mut self,
        source: &HtmlVideoElement,
        revision: u32,
    ) -> Result<(), JsValue> {
        if self.revision != Some(revision) {
            self.gl
                .bind_texture(Gl::TEXTURE_2D, Some(&self.textures[0]));
            self.gl
                .tex_sub_image_2d_with_u32_and_u32_and_html_video_element(
                    Gl::TEXTURE_2D,
                    0,
                    0,
                    0,
                    Gl::RGBA,
                    Gl::UNSIGNED_BYTE,
                    source,
                )?;
            self.blur_source();
            self.revision = Some(revision);
        }
        self.draw();
        Ok(())
    }
}

impl GlassRenderer {
    fn blur_source(&self) {
        let gl = &self.gl;
        gl.disable(Gl::BLEND);
        gl.use_program(Some(&self.blur.handle));
        gl.uniform1i(self.blur.full.as_ref(), 1);
        for index in 0..2 {
            gl.bind_framebuffer(Gl::FRAMEBUFFER, Some(&self.frames[index]));
            gl.bind_texture(Gl::TEXTURE_2D, Some(&self.textures[index]));
            gl.uniform2f(
                self.blur.step.as_ref(),
                if index == 0 {
                    1. / self.width as f32
                } else {
                    0.
                },
                if index == 1 {
                    1. / self.height as f32
                } else {
                    0.
                },
            );
            gl.draw_arrays(Gl::TRIANGLES, 0, 6);
        }
    }

    fn draw(&self) {
        let gl = &self.gl;
        gl.bind_framebuffer(Gl::FRAMEBUFFER, None);
        gl.clear_color(0., 0., 0., 0.);
        gl.clear(Gl::COLOR_BUFFER_BIT);
        gl.enable(Gl::BLEND);
        gl.blend_func_separate(
            Gl::SRC_ALPHA,
            Gl::ONE_MINUS_SRC_ALPHA,
            Gl::ONE,
            Gl::ONE_MINUS_SRC_ALPHA,
        );
        gl.use_program(Some(&self.glass.handle));
        gl.uniform1i(self.glass.full.as_ref(), 0);
        gl.bind_texture(Gl::TEXTURE_2D, Some(&self.textures[2]));
        gl.draw_arrays_instanced(Gl::TRIANGLES, 0, 6, self.count);
        gl.flush();
    }
}

impl Drop for GlassRenderer {
    fn drop(&mut self) {
        for texture in &self.textures {
            self.gl.delete_texture(Some(texture));
        }
        for frame in &self.frames {
            self.gl.delete_framebuffer(Some(frame));
        }
        self.gl.delete_buffer(Some(&self.lenses));
        self.gl.delete_vertex_array(Some(&self.vertices));
        self.gl.delete_program(Some(&self.blur.handle));
        self.gl.delete_program(Some(&self.glass.handle));
    }
}

#[cfg(test)]
mod tests {
    use super::validate_lenses;

    #[test]
    fn rejects_malformed_gpu_records() {
        assert!(validate_lenses(&[]).is_err());
        assert!(validate_lenses(&[0.; 7]).is_err());
        assert!(validate_lenses(&[0., 0., -1., 30., 10., 5., 8., 0.7]).is_err());
        assert!(validate_lenses(&[f32::NAN, 0., 50., 30., 10., 5., 8., 0.7]).is_err());
    }

    #[test]
    fn accepts_capacity_boundary_and_rejects_overflow() {
        let lens = [0., 0., 50., 30., 10., 5., 8., 0.7];
        assert_eq!(validate_lenses(&lens.repeat(1000)), Ok(1000));
        assert!(validate_lenses(&lens.repeat(1001)).is_err());
    }
}
