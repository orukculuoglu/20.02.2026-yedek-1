#!/usr/bin/env node

/**
 * V2.2.1 Quick Verification Script
 * Tests:
 * 1. Status NOT changing when applyStatusChange=false
 * 2. Status CHANGING when applyStatusChange=true
 */

const API_BASE = 'http://localhost:3001/api';

async function test() {
  const headers = {
    'x-tenant-id': 'FLEET-001',
    'x-role': 'ops',
    'Content-Type': 'application/json',
  };

  console.log('\n=== V2.2.1 Verification ===\n');

  try {
    // Test 1: Policy OFF (applyStatusChange=false)
    console.log('📋 TEST 1: applyStatusChange=false (Policy OFF)');
    const res1 = await fetch(`${API_BASE}/vehicle/VEH-004/service-redirects`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        servicePointId: 'SP-001',
        reason: 'Maintenance',
        note: 'Test 1',
        applyStatusChange: false,
      }),
    });

    const data1 = await res1.json();
    console.log(`   Vehicle Status: ${data1.updatedVehicle.status}`);
    console.log(`   applyStatusChange: ${data1.updatedVehicle.applyStatusChange}`);
    console.log(`   Expected: ACTIVE + false`);
    console.log(`   Result: ${data1.updatedVehicle.status === 'ACTIVE' ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 2: Policy ON (applyStatusChange=true)
    console.log('📋 TEST 2: applyStatusChange=true (Policy ON)');
    const res2 = await fetch(`${API_BASE}/vehicle/VEH-005/service-redirects`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        servicePointId: 'SP-005',
        reason: 'Maintenance',
        note: 'Test 2',
        applyStatusChange: true,
      }),
    });

    const data2 = await res2.json();
    console.log(`   Vehicle Status: ${data2.updatedVehicle.status}`);
    console.log(`   applyStatusChange: ${data2.updatedVehicle.applyStatusChange}`);
    console.log(`   newStatus: ${data2.redirect.newStatus}`);
    console.log(`   Expected: Serviced + true`);
    console.log(`   Result: ${data2.updatedVehicle.status === 'Serviced' ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 3: Verify summary refetch
    console.log('📋 TEST 3: Summary Refetch After Redirect');
    const res3 = await fetch(`${API_BASE}/vehicle/VEH-005/summary`, {
      method: 'GET',
      headers,
    });

    const data3 = await res3.json();
    console.log(`   Vehicle Status from Summary: ${data3.status}`);
    console.log(`   Expected: Serviced (unchanged)`);
    console.log(`   Result: ${data3.status === 'Serviced' ? '✅ PASS' : '❌ FAIL'}\n`);

    console.log('=== All Tests Complete ===\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test();
