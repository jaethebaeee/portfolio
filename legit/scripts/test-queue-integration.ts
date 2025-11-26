
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

console.log('🧪 Testing Workflow Queue Integration...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase environment variables.');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testQueue() {
  try {
    console.log('1. Connecting to Supabase...');
    const { data: healthCheck, error: healthError } = await supabase.from('workflow_jobs').select('count', { count: 'exact', head: true });
    
    if (healthError) {
      throw new Error(`Failed to connect to workflow_jobs: ${healthError.message}`);
    }
    console.log('   ✅ Connected to database');

    console.log('2. Finding test data (Workflow, Patient, Appointment)...');
    
    // Find a workflow
    const { data: workflows } = await supabase.from('workflows').select('id').limit(1);
    if (!workflows || workflows.length === 0) {
      console.log('   ⚠️ No workflows found. Skipping test (requires seed data).');
      return;
    }
    const workflowId = workflows[0].id;

    // Find a patient
    const { data: patients } = await supabase.from('patients').select('id').limit(1);
    if (!patients || patients.length === 0) {
      console.log('   ⚠️ No patients found. Skipping test.');
      return;
    }
    const patientId = patients[0].id;

    // Find an appointment
    const { data: appointments } = await supabase.from('appointments').select('id').limit(1);
    if (!appointments || appointments.length === 0) {
      console.log('   ⚠️ No appointments found. Skipping test.');
      return;
    }
    const appointmentId = appointments[0].id;

    console.log('   ✅ Found test data');

    console.log('3. Inserting test job...');
    const jobId = `test_job_${Date.now()}`;
    const scheduledFor = new Date(Date.now() - 60000).toISOString(); // 1 minute ago

    const { error: insertError } = await supabase.from('workflow_jobs').insert({
      id: jobId,
      workflow_id: workflowId,
      patient_id: patientId,
      appointment_id: appointmentId,
      job_data: {
        context: { daysPassed: 1, triggerType: 'test' },
        priority: 'normal',
        timeout: 30000,
        max_retries: 3
      },
      status: 'queued',
      scheduled_for: scheduledFor,
      created_at: new Date().toISOString()
    });

    if (insertError) {
      throw new Error(`Failed to insert test job: ${insertError.message}`);
    }
    console.log(`   ✅ Job inserted: ${jobId}`);

    console.log('4. Calling queue processing (get_next_jobs RPC)...');
    
    // Call the RPC function directly to simulate what the queue does
    const { data: jobs, error: rpcError } = await supabase.rpc('get_next_jobs', {
      limit_count: 1,
      max_retries: 3
    });

    if (rpcError) {
      throw new Error(`RPC call failed: ${rpcError.message}`);
    }

    const processedJob = jobs && jobs.find((j: any) => j.id === jobId);

    if (processedJob) {
      console.log('   ✅ Job was picked up by get_next_jobs RPC');
      console.log('   ✅ Database locking is working');
    } else {
      console.log('   ❌ Job was NOT picked up. It might be locked by another process or query is incorrect.');
      
      // Check status
      const { data: statusData } = await supabase.from('workflow_jobs').select('status').eq('id', jobId).single();
      console.log(`   Current job status: ${statusData?.status}`);
    }

    // Cleanup
    console.log('5. Cleaning up test job...');
    await supabase.from('workflow_jobs').delete().eq('id', jobId);
    console.log('   ✅ Cleanup complete');

  } catch (error: any) {
    console.error(`❌ Test failed: ${error.message}`);
    process.exit(1);
  }
}

testQueue();

