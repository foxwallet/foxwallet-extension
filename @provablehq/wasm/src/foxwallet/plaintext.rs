// Copyright (C) 2019-2023 Aleo Systems Inc.
// This file is part of the Aleo SDK library.

// The Aleo SDK library is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// The Aleo SDK library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with the Aleo SDK library. If not, see <https://www.gnu.org/licenses/>.

use crate::types::native::PlaintextNative;

use serde_json::{Value, json};
use std::str::FromStr;
use wasm_bindgen::prelude::wasm_bindgen;

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
                PlaintextNative::Literal(literal, ..) => serde_json::Value::String(format!("{}", literal)),
                PlaintextNative::Struct(struct_, ..) => {
                    let mut map = serde_json::value::Map::new();
                    let _ = struct_.iter().enumerate().try_for_each(|(_i, (name, plaintext))| {
                        match plaintext {
                            PlaintextNative::Literal(literal, ..) => {
                                map.insert(name.to_string(), serde_json::Value::String(format!("{}", literal)));
                            }
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
                            }
                            PlaintextNative::Struct(..) | PlaintextNative::Array(..) => {
                                res.push(aleo_parse_plaintext(&plaintext.clone()));
                            }
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
