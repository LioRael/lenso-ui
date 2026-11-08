//! Wasm adapter for the shared core, using the production WebGL driver.

use lenso_glass_renderer::GlassRenderer;
use wasm_bindgen::prelude::*;
use web_sys::HtmlCanvasElement;

/// Builds a browser renderer for the iOS 27 Small or Medium material.
///
/// # Errors
/// Rejects unsupported material records and propagates browser/GPU errors.
#[wasm_bindgen]
pub fn create_renderer(
    canvas: &HtmlCanvasElement,
    material: &[f32],
) -> Result<GlassRenderer, JsValue> {
    if material.len() != 4
        || material[0] != 27.0
        || ![0.0, 1.0].contains(&material[1])
        || ![0.0, 1.0].contains(&material[2])
    {
        return Err(JsValue::from_str(
            "prototype supports iOS 27 light/dark Small/Medium only",
        ));
    }
    GlassRenderer::new(canvas, material)
}
