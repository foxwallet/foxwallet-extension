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

use crate::types::native::{CurrentNetwork, Network, ValueNative};
use snarkvm_console::prelude::ToBits;
use std::str::FromStr;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen(js_name = "hashBHP256")]
pub fn hash_bhp256(value: &str) -> Result<String, String> {
    let value = ValueNative::from_str(value).map_err(|e| e.to_string()).unwrap();
    let id = CurrentNetwork::hash_bhp256(&value.to_bits_le()).map_err(|e| e.to_string()).unwrap();
    Ok(id.to_string())
}
