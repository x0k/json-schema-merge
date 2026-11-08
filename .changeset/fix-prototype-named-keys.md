---
"@x0k/json-schema-merge": patch
---

Fix handling of keys that shadow `Object.prototype` members such as `constructor` and `toString`, and treat `__proto__` as an own property instead of changing the object's prototype.
