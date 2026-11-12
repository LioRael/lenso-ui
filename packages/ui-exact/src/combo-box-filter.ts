// Adapted from Base UI 1.9.0 internals/filter; pure string matching only.
// MIT License
//
// Copyright (c) 2019 Material-UI SAS
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
export function comboBoxFilter(mode: string, locale: string) {
  if (mode !== "contains" && mode !== "startsWith" && mode !== "none")
    throw new RangeError(`Unknown ComboBox filter: ${mode}`);
  const collator = new Intl.Collator(locale, {
    usage: "search",
    sensitivity: "base",
    ignorePunctuation: true,
  });
  return (label: string, query: string) => {
    if (!query || mode === "none") return true;
    if (mode === "startsWith") return collator.compare(label.slice(0, query.length), query) === 0;
    for (let i = 0; i <= label.length - query.length; i++)
      if (collator.compare(label.slice(i, i + query.length), query) === 0) return true;
    return false;
  };
}
