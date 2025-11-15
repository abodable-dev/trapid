/**
 * GANTT DRAG TEST MONITOR
 *
 * Paste this into browser console BEFORE opening Gantt view.
 * It monitors API calls and detects infinite loops.
 *
 * After dragging a task, it will report:
 * - How many API calls were made
 * - If an infinite loop was detected
 * - If the fix is working
 */

console.clear();
console.log('🔬 GANTT DRAG MONITOR ACTIVE\n');
console.log('📋 Instructions:');
console.log('  1. Open Schedule Master → Gantt View');
console.log('  2. Drag Task 1 forward by 5 days');
console.log('  3. Release and wait 3 seconds');
console.log('  4. Check results below\n');

const startTime = performance.now();
const apiCalls = [];
const stateUpdates = [];
const ganttReloads = [];
let dragStartTime = null;
let dragEndTime = null;

// Monitor API calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  const method = args[1]?.method || 'GET';

  if (url.includes('/api/v1/schedule_templates') && url.includes('/rows/')) {
    const timestamp = performance.now() - startTime;
    const match = url.match(/\/rows\/(\d+)/);
    const taskId = match ? match[1] : 'unknown';

    apiCalls.push({
      timestamp: timestamp.toFixed(2),
      method: method,
      taskId: taskId,
      url: url
    });

    console.log(`🌐 [${timestamp.toFixed(2)}ms] API ${method} task ${taskId}`);
  }

  return originalFetch.apply(window, args);
};

// Monitor console logs for specific patterns
const originalLog = console.log;
console.log = function(...args) {
  const msg = args.join(' ');
  const timestamp = performance.now() - startTime;

  // Detect drag start
  if (msg.includes('DRAG START')) {
    dragStartTime = timestamp;
    console.log = originalLog; // Restore temporarily
    console.log(`\n🟢 [${timestamp.toFixed(2)}ms] === DRAG STARTED ===`);
    console.log = arguments.callee; // Re-intercept
  }

  // Detect drag end
  if (msg.includes('DRAG END')) {
    dragEndTime = timestamp;
    console.log = originalLog;
    console.log(`🔴 [${timestamp.toFixed(2)}ms] === DRAG ENDED ===`);
    console.log = arguments.callee;

    // Schedule report after 3 seconds
    setTimeout(() => generateReport(), 3000);
  }

  // Detect state updates
  if (msg.includes('Applying') && msg.includes('batched cascade')) {
    stateUpdates.push({
      timestamp: timestamp.toFixed(2),
      message: msg
    });
  }

  // Detect Gantt reloads
  if (msg.includes('Starting Gantt reload')) {
    ganttReloads.push({
      timestamp: timestamp.toFixed(2)
    });
  }

  // Pass through to original
  originalLog.apply(console, args);
};

function generateReport() {
  console.log = originalLog; // Restore console

  console.log('\n\n' + '='.repeat(70));
  console.log('📊 GANTT DRAG TEST REPORT');
  console.log('='.repeat(70));

  if (!dragStartTime || !dragEndTime) {
    console.log('\n⚠️  NO DRAG DETECTED - Drag a task to run the test');
    return;
  }

  const dragDuration = dragEndTime - dragStartTime;
  const totalDuration = performance.now() - startTime;

  console.log(`\n⏱️  Timing:`);
  console.log(`   Drag duration: ${dragDuration.toFixed(2)}ms`);
  console.log(`   Total test time: ${totalDuration.toFixed(2)}ms`);

  // API Calls Analysis
  console.log(`\n🌐 API Calls: ${apiCalls.length} total`);

  // Group by taskId
  const callsByTask = {};
  apiCalls.forEach(call => {
    if (!callsByTask[call.taskId]) {
      callsByTask[call.taskId] = [];
    }
    callsByTask[call.taskId].push(call);
  });

  Object.keys(callsByTask).forEach(taskId => {
    const calls = callsByTask[taskId];
    console.log(`   Task ${taskId}: ${calls.length} call${calls.length > 1 ? 's' : ''}`);

    if (calls.length > 1) {
      console.log(`   ⚠️  DUPLICATE CALLS DETECTED FOR TASK ${taskId}!`);
      calls.forEach((call, idx) => {
        console.log(`      #${idx + 1} at ${call.timestamp}ms`);
      });
    }
  });

  // State Updates Analysis
  console.log(`\n📦 State Updates (Batches): ${stateUpdates.length}`);
  stateUpdates.forEach((update, idx) => {
    console.log(`   #${idx + 1} at ${update.timestamp}ms - ${update.message}`);
  });

  // Gantt Reloads Analysis
  console.log(`\n🔄 Gantt Reloads: ${ganttReloads.length}`);
  ganttReloads.forEach((reload, idx) => {
    console.log(`   #${idx + 1} at ${reload.timestamp}ms`);
  });

  // Verdict
  console.log('\n' + '='.repeat(70));

  const hasDuplicateCalls = Object.values(callsByTask).some(calls => calls.length > 1);
  const hasMultipleBatches = stateUpdates.length > 1;
  const hasMultipleReloads = ganttReloads.length > 1;

  if (!hasDuplicateCalls && !hasMultipleBatches && ganttReloads.length <= 1) {
    console.log('✅ TEST PASSED: No infinite loop detected!');
    console.log('   - No duplicate API calls');
    console.log('   - Single batch of cascade updates');
    console.log('   - Single Gantt reload (or none)');
    console.log('\n🎉 THE FIX IS WORKING!');
  } else {
    console.log('❌ TEST FAILED: Issues detected:');

    if (hasDuplicateCalls) {
      console.log('   ❌ Duplicate API calls found (infinite loop risk)');
    }

    if (hasMultipleBatches) {
      console.log(`   ❌ Multiple batches (${stateUpdates.length}) instead of 1`);
    }

    if (hasMultipleReloads) {
      console.log(`   ❌ Multiple Gantt reloads (${ganttReloads.length}) instead of 1`);
    }

    console.log('\n⚠️  THE FIX NEEDS MORE WORK');
  }

  console.log('='.repeat(70));
  console.log('\n💾 Copy this report and share with Claude Code if needed.\n');
}

console.log('✅ Monitor ready. Open Gantt and drag a task!\n');
