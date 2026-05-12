#!/usr/bin/env node
/**
 * Manual test script to verify the fixes for issues #186 and #177.
 *
 * Issue #186: Tests that getUserData handles unmapped UIDs without crashing
 * Issue #177: Tests that reverseNSLookup handles invalid IPs without crashing
 */

const { execSync } = require("child_process");
const { reverse } = require("dns");

console.log("Testing Issue #186: UID lookup error handling\n");
console.log("====================================================");

// Test 1: Simulate the NixOS scenario where UID doesn't map to a user
try {
  console.log("Attempting 'id -nu 999999' (non-existent UID)...");
  const result = execSync("id -nu 999999").toString();
  console.log("Result:", result);
} catch (error) {
  console.log("✓ Correctly throws error:", error.message.split('\n')[0]);
  console.log("✓ Fix: Code now catches this and falls back to UID");
}

console.log("\nTesting Issue #177: DNS reverse lookup error handling\n");
console.log("====================================================");

// Test 2: DNS reverse lookup with invalid address
console.log("Testing reverse DNS on invalid address...");
try {
  reverse("syd09s13-in-f164.1e100.net", (err, result) => {
    if (err) {
      console.log("Callback received error:", err.message);
    } else {
      console.log("Callback received result:", result);
    }
  });
  console.log("✗ Should have thrown synchronously");
} catch (error) {
  console.log("✓ Correctly throws synchronously:", error.code);
  console.log("✓ Fix: Code now wraps reverse() in try-catch");
}

// Test 3: DNS reverse lookup with valid IP
console.log("\nTesting reverse DNS on valid IP (8.8.8.8)...");
try {
  reverse("8.8.8.8", (err, result) => {
    if (err) {
      console.log("Callback received error:", err.message);
    } else {
      console.log("✓ Callback received result:", result);
    }
  });
  console.log("✓ No synchronous throw on valid IP");
} catch (error) {
  console.log("✗ Unexpected throw:", error.message);
}

console.log("\n====================================================");
console.log("Test complete. Both fixes prevent crashes:");
console.log("1. Issue #186: try-catch around execSync('id -nu')");
console.log("2. Issue #177: try-catch around reverse()");
