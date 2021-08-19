let usage = process.cpuUsage();
const startTime = process.hrtime.bigint();

// Start of benchmark
const smi = require('node-nvidia-smi');
smi((err, data) => {
	const { used,  total } = data.nvidia_smi_log.gpu.fb_memory_usage;
    
	// End of benchmark
	const endTime = process.hrtime.bigint();
	usage = process.cpuUsage(usage);
	const elapsed = endTime - startTime;
    
	console.log("Result data:", { used, total });
	console.log("CPU Used: ", usage);
	console.log("Elapsed:", {
		nanoseconds: Number(elapsed),
		milliseconds: Number(elapsed) / 1_000_000,
		seconds: Number(elapsed) / 1_000_000_000
	});
});