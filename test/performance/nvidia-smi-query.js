let usage = process.cpuUsage();
const startTime = process.hrtime.bigint();

// Start of benchmark
const parse = require('csv-parse/lib/sync'); 
const exec = require('child_process').exec;

exec('nvidia-smi --format=csv --query-gpu=memory.used,memory.total', (err, stdout) => { 
	const entries = parse(stdout, {
		columns: true,
		skip_empty_lines: true, 
		trim: true 
	});
	
	// End of benchmark
	const endTime = process.hrtime.bigint();
	usage = process.cpuUsage(usage);
	const elapsed = endTime - startTime;
	
	console.log("Result data:", {
		used: entries[0]['memory.used [MiB]'], 
		total: entries[0]['memory.total [MiB]']
	});
	
	console.log("CPU Used:", usage);
	console.log("Elapsed:", {
		nanoseconds: Number(elapsed),
		milliseconds: Number(elapsed) / 1_000_000,
		seconds: Number(elapsed) / 1_000_000_000
	});
});