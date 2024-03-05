use crate::types::{PlaintextNative, Parser};

use std::str::FromStr;
use wasm_bindgen::prelude::wasm_bindgen;
use serde_json::{json, Value};

/// Webassembly Representation of an Aleo transaction
///
/// This object is created when generating an on-chain function deployment or execution and is the
/// object that should be submitted to the Aleo Network in order to deploy or execute a function.
#[wasm_bindgen]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Plaintext(PlaintextNative);

#[wasm_bindgen]
impl Plaintext {
    #[wasm_bindgen(js_name = fromString)]
    pub fn from_string(plaintext: &str) -> Result<Plaintext, String> {
      Self::from_str(plaintext).map_err(|_| "The plaintext string provided was invalid".to_string())
    }

    #[wasm_bindgen(js_name = toJSON)]
    pub fn to_json(&self) -> String {
        fn aleo_parse_plaintext(plaintext: &PlaintextNative) -> serde_json::Value {
            match plaintext {
                PlaintextNative::Literal(literal, ..) => {
                    serde_json::Value::String(format!("{}", literal))
                }
                PlaintextNative::Struct(struct_, ..) => {
                    let mut map = serde_json::value::Map::new();
                    let _ = struct_.iter().enumerate().try_for_each(|(_i, (name, plaintext))| {
                        match plaintext {
                            PlaintextNative::Literal(literal, ..) => {
                                map.insert(name.to_string(), serde_json::Value::String(format!("{}", literal)));
                            },
                            PlaintextNative::Struct(..) | PlaintextNative::Array(..) => {
                                map.insert(name.to_string(), aleo_parse_plaintext(&plaintext.clone()));
                            }
                        }
                        Ok::<(), String>(())
                    });
                    Value::Object(map)
                }
                PlaintextNative::Array(array, ..) => {
                    let mut res: Vec<serde_json::Value> = vec![];
                    let _ = array.iter().enumerate().try_for_each(|(_i, plaintext)| {
                        match plaintext {
                            PlaintextNative::Literal(literal, ..) => {
                                res.push(serde_json::Value::String(format!("{}", literal)));
                            },
                            PlaintextNative::Struct(..) | PlaintextNative::Array(..) => {
                                res.push(aleo_parse_plaintext(&plaintext.clone()));
                            },
                        }
                        Ok::<(), String>(())
                    });
                    Value::Array(res)
                }
            }
        }

        let res = aleo_parse_plaintext(&self.0);
        json!(res).to_string()
    }
}

impl From<Plaintext> for PlaintextNative {
    fn from(field: Plaintext) -> Self {
        field.0
    }
}

impl From<PlaintextNative> for Plaintext {
    fn from(field: PlaintextNative) -> Self {
        Self(field)
    }
}

impl FromStr for Plaintext {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
      Self::from_str(s).map_err(|_| "The plaintext string provided was invalid".to_string())
    }
}