use crate::{types::{FutureNative, ArgumentNative, PlaintextNative}};

use std::{ops::Deref, str::FromStr};
use wasm_bindgen::prelude::*;
use serde_json::{json, Value};

/// Plaintext representation of an Aleo record
#[wasm_bindgen]
#[derive(Clone)]
pub struct Future(FutureNative);

#[wasm_bindgen]
impl Future {
    /// Create a Future from a string
    ///
    /// @param {string} future String representation of a future
    /// @returns {Future | Error} Future
    #[wasm_bindgen(js_name = fromString)]
    pub fn from_string(future: &str) -> Result<Future, String> {
        Self::from_str(future).map_err(|_| "The future string provided was invalid".to_string())
    }

    /// Return the string reprensentation of the future
    ///
    /// @returns {string} String representation of the future
    #[allow(clippy::inherent_to_string)]
    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        self.0.to_string()
    }

    /// Return the JSON representation of the future
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


        fn aleo_parse_future(future: &FutureNative) -> serde_json::Value {
            let mut map = serde_json::value::Map::new();
            let program_id = future.program_id().to_string();
            let function_name = future.function_name().to_string();
            let mut argument_values: Vec<serde_json::Value> = vec![];
            let _ = future.arguments().iter().enumerate().try_for_each(|(_i, argument)| {
                match argument {
                    ArgumentNative::Plaintext(plaintext) => {
                        argument_values.push(aleo_parse_plaintext(&plaintext));
                    }
                    ArgumentNative::Future(future) => {
                        argument_values.push(aleo_parse_future(&future));
                    }
                }
                Ok::<(), String>(())
            });
            let values = Value::Array(argument_values);
            map.insert("program_id".to_string(), serde_json::Value::String(program_id));
            map.insert("function_name".to_string(), serde_json::Value::String(function_name));
            map.insert("arguments".to_string(), values);
            Value::Object(map)
        }


        let res = aleo_parse_future(&self);
        json!({
            "data": res,
        }).to_string()
    }
}

impl FromStr for Future {
    type Err = anyhow::Error;

    fn from_str(text: &str) -> Result<Self, Self::Err> {
        Ok(Self(FutureNative::from_str(text)?))
    }
}

impl Deref for Future {
    type Target = FutureNative;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    use wasm_bindgen_test::wasm_bindgen_test;

    #[wasm_bindgen_test]
    fn test_parse_future() {
        let future_text = String::from("{\n  program_id: credits.aleo,\n  function_name: fee_public,\n  arguments: [\n    aleo1xs53pjftr8vst9ev2drwdu0kyyj2f4fxx93j3n30hfr8dqjnwq8qyvka7t,\n    12210u64\n  ]\n}");
        let except = String::from("{\"data\":{\"program_id\":\"credits.aleo\",\"function_name\":\"fee_public\",\"arguments\":[\"aleo1xs53pjftr8vst9ev2drwdu0kyyj2f4fxx93j3n30hfr8dqjnwq8qyvka7t\",\"12210u64\"]}}");
        let record = Future::from_string(&future_text).unwrap();
        let res = record.to_json();
        println!("res {}", res);
        assert_eq!(except, res);
    }
}