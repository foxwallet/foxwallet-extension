use crate::types::{ValueNative, CurrentNetwork, ToBits, Network};
use std::str::FromStr;
use wasm_bindgen::prelude::wasm_bindgen;


#[wasm_bindgen(js_name = "hashBHP256")]
pub fn hash_bhp256(value: &str) -> Result<String, String> {
  let value = ValueNative::from_str(value).map_err(|e| e.to_string()).unwrap();
  let id = CurrentNetwork::hash_bhp256(&value.to_bits_le()).map_err(|e| e.to_string()).unwrap();
  Ok(id.to_string())
}