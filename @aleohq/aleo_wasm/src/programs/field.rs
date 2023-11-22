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

use crate::types::FieldNative;

use std::str::FromStr;
use wasm_bindgen::prelude::wasm_bindgen;

/// Webassembly Representation of an Aleo transaction
///
/// This object is created when generating an on-chain function deployment or execution and is the
/// object that should be submitted to the Aleo Network in order to deploy or execute a function.
#[wasm_bindgen]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Field(FieldNative);

#[wasm_bindgen]
impl Field {
    /// Create a field from a string
    ///
    /// @param {string} field String representation of a field
    /// @returns {Field | Error}
    #[wasm_bindgen(js_name = fromString)]
    pub fn from_string(field: &str) -> Result<Field, String> {
        Field::from_str(field)
    }

    /// Get the field as a string.
    ///
    /// @returns {string} String representation of the field
    #[wasm_bindgen(js_name = toString)]
    #[allow(clippy::inherent_to_string)]
    pub fn to_string(&self) -> String {
        self.0.to_string()
    }

    pub fn clone(&self) -> Self {
        Self(self.0.clone())
    }
}

impl From<Field> for FieldNative {
    fn from(field: Field) -> Self {
        field.0
    }
}

impl From<FieldNative> for Field {
    fn from(field: FieldNative) -> Self {
        Self(field)
    }
}

impl FromStr for Field {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Self(FieldNative::from_str(s).map_err(|e| e.to_string())?))
    }
}