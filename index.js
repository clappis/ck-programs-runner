const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);
const stats = require("stats-lite")

const programs = [
"cbench-automotive-bitcount",
"cbench-automotive-qsort1",
"cbench-automotive-susan",
"cbench-bzip2",
"cbench-consumer-jpeg-c",
"cbench-consumer-jpeg-d",
"cbench-consumer-tiff2bw",
"cbench-consumer-tiff2dither",
"cbench-consumer-tiff2median",
"cbench-consumer-tiff2rgba",
"cbench-network-dijkstra",
"cbench-network-patricia",
"cbench-office-stringsearch2",
"cbench-security-rijndael",
"cbench-security-sha",
"cbench-telecom-adpcm-c",
"cbench-telecom-adpcm-d",
"cbench-telecom-crc32",
"cbench-telecom-gsm",
"polybench-cpu-3mm",
"polybench-cpu-trmm",
"polybench-cpu-lu",
"polybench-cpu-doitgen",
"polybench-cpu-jacobi-2d-imper",
"polybench-cpu-fdtd-2d",
"polybench-cpu-symm",
"polybench-cpu-atax",
"polybench-cpu-durbin",
"polybench-cpu-bicg",
"polybench-cpu-adi",
"polybench-cpu-gemm",
"polybench-cpu-jacobi-1d-imper",
"polybench-cpu-gramschmidt",
"polybench-cpu-fdtd-apml",
"polybench-cpu-ludcmp",
"polybench-cpu-trisolv",
"polybench-cpu-gesummv",
"polybench-cpu-mvt", 
"polybench-cpu-syr2k",
"polybench-cpu-cholesky",
"polybench-cpu-dynprog",
"polybench-cpu-medley-reg-detect",
"polybench-cpu-medley-floyd-warshall",
"polybench-cpu-syrk",
"polybench-cpu-2mm",
"polybench-cpu-seidel-2d",
"polybench-cpu-gemver",
"milepost-codelet-mibench-office-ghostscript-src-gdevpbm-codelet-1-1", 
"milepost-codelet-mibench-telecomm-adpcm-c-src-adpcm-codelet-1-1",
"milepost-codelet-mibench-telecomm-fft-fftmisc-codelet-5-1",
"milepost-codelet-mibench-office-rsynth-src-nsynth-codelet-5-1",
"milepost-codelet-mibench-consumer-lame-src-newmdct-codelet-10-1",
"milepost-codelet-mibench-automotive-basicmath-isqrt-codelet-1-1",
"milepost-codelet-mibench-consumer-lame-src-fft-codelet-2-1",
"milepost-codelet-mibench-consumer-tiffmedian-src-tiffmedian-codelet-3-1",
"milepost-codelet-mibench-telecomm-fft-fourierf-codelet-3-1", 
"milepost-codelet-mibench-security-pgp-d-src-mpilib-codelet-1-1",
"milepost-codelet-mibench-consumer-tiffmedian-src-tiffmedian-codelet-4-1",
"milepost-codelet-mibench-consumer-jpeg-c-src-jcdctmgr-codelet-13-1",
"milepost-codelet-mibench-consumer-lame-src-takehiro-codelet-16-1",
"milepost-codelet-mibench-consumer-tiffmedian-src-tiffmedian-codelet-1-1",
"milepost-codelet-mibench-telecomm-gsm-src-rpe-codelet-4-1",
"milepost-codelet-mibench-automotive-basicmath-cubic-codelet-3-1",
"milepost-codelet-mibench-consumer-lame-src-quantize-pvt-codelet-6-1", 
"milepost-codelet-mibench-consumer-tiff2rgba-src-tif-predict-codelet-4-1",
"milepost-codelet-mibench-consumer-mad-src-layer3-codelet-5-1",
"milepost-codelet-mibench-telecomm-gsm-src-short-term-codelet-2-1",
"milepost-codelet-mibench-automotive-qsort1-src-qsort-codelet-1-1",
"milepost-codelet-mibench-consumer-tiffmedian-src-tiffmedian-codelet-5-1",
"milepost-codelet-mibench-consumer-lame-src-quantize-codelet-7-1",
"milepost-codelet-mibench-consumer-tiffdither-src-tif-fax3-codelet-8-1",
"milepost-codelet-mibench-consumer-tiffdither-src-tiffdither-codelet-1-1",
"milepost-codelet-mibench-consumer-mad-src-layer3-codelet-6-1",
"milepost-codelet-mibench-automotive-susan-s-src-susan-codelet-1-1",
"milepost-codelet-mibench-security-pgp-e-src-mpilib-codelet-4-1",
"milepost-codelet-mibench-consumer-tiffmedian-src-tiffmedian-codelet-6-1",
"milepost-codelet-mibench-consumer-jpeg-c-src-jfdctint-codelet-2-1",
"milepost-codelet-mibench-automotive-bitcount-src-bitcnts-codelet-1-1",
"milepost-codelet-mibench-consumer-tiffdither-src-tif-fax3-codelet-9-1",
"milepost-codelet-mibench-consumer-lame-src-takehiro-codelet-5-1",
"milepost-codelet-mibench-automotive-susan-e-src-susan-codelet-10-1",
"milepost-codelet-mibench-automotive-susan-e-src-susan-codelet-2-1",
"milepost-codelet-mibench-security-pgp-e-src-mpilib-codelet-3-1",
"milepost-codelet-mibench-consumer-jpeg-c-src-jchuff-codelet-9-1",
"milepost-codelet-mibench-security-pgp-e-src-mpilib-codelet-1-1",
"milepost-codelet-mibench-consumer-lame-src-psymodel-codelet-17-1",
"milepost-codelet-mibench-network-dijkstra-src-dijkstra-large-codelet-5-1",
"milepost-codelet-mibench-consumer-lame-src-newmdct-codelet-3-1",
"milepost-codelet-mibench-telecomm-adpcm-d-src-adpcm-codelet-1-1"
]

const total_execution = 3;
const maxBuffer = 1024000;

const inputs = [
  { program : "cbench-automotive-susan", value: "--cmd_key=edges --dataset_uoa=image-pgm-0001", name: "edges"},
  { program : "cbench-automotive-susan", value: "--cmd_key=corners --dataset_uoa=image-pgm-0001", name : "corners"},
  { program : "cbench-automotive-susan", value: "--cmd_key=smoothing --dataset_uoa=image-pgm-0001", name : "smoothing"},
  { program : "cbench-bzip2", value: "--cmd_key=decode", name : "decode"},
  { program : "cbench-bzip2", value: "--cmd_key=encode --dataset_uoa=adpcm-0001", name : "encode"},
  { program : "cbench-consumer-jpeg-c", value: "--dataset_uoa=image-ppm-0001"},
  { program : "cbench-consumer-jpeg-d", value: "--dataset_uoa=image-jpeg-dnn-cat"},
  { program : "cbench-office-stringsearch2", value: "--dataset_file=\"data.txt\" env.dataset_filename_1=data.txt"},
  { program : "cbench-security-rijndael", value: "--cmd_key=encode --dataset_uoa=adpcm-0001", name : "encode"},
  { program : "cbench-security-rijndael", value: "--cmd_key=decode", name : "decode"},
  { program : "cbench-security-sha", value: "--dataset_uoa=adpcm-0001"},
  { program : "cbench-telecom-crc32", value: "--dataset_uoa=adpcm-0001"}
]
 
  


const optimizations = [
  { reference_name : "OPT01" , value : "-O1 -fcse-follow-jumps -fno-tree-ter -ftree-vectorize" },
  { reference_name : "OPT02" , value : "-O1 -fno-cprop-registers -fno-dce -fno-move-loop-invariants -frename-registers -fno-tree-copy-prop -fno-tree-copyrename" },
  { reference_name : "OPT03" , value : "-O1 -freorder-blocks -fschedule-insns -fno-tree-ccp -fno-tree-dominator-opts" },
  { reference_name : "OPT04" , value : "-O2" },
  { reference_name : "OPT05" , value : "-O2 -falign-loops -fno-cse-follow-jumps -fno-dce -fno-gcse-lm -fno-inline-functions-called-once -fno-schedule-insns2 -fno-tree-ccp -fno-tree-copyrename -funroll-all-loops" },
  { reference_name : "OPT06" , value : "-O2 -finline-functions -fno-omit-frame-pointer -fschedule-insns -fno-split-ivs-in-unroller -fno-tree-sink -funroll-all-loops" },
  { reference_name : "OPT07" , value : "-O2 -fno-align-jumps -fno-early-inlining -fno-gcse -fno-inline-functions-called-once -fno-move-loop-invariants -fschedule-insns -fno-tree-copyrename -fno-tree-loop-optimize -fno-tree-ter -fno-tree-vrp" },
  { reference_name : "OPT08" , value : "-O2 -fno-caller-saves -fno-guess-branch-probability -fno-ira-share-spill-slots -fno-tree-reassoc -funroll-all-loops -fno-web" },
  { reference_name : "OPT09" , value : "-O2 -fno-caller-saves -fno-ivopts -fno-reorder-blocks -fno-strict-overflow -funroll-all-loops" },
  { reference_name : "OPT10" , value : "-O2 -fno-cprop-registers -fno-move-loop-invariants -fno-omit-frame-pointer -fpeel-loops" },
  { reference_name : "OPT11" , value : "-O2 -fno-dce -fno-guess-branch-probability -fno-strict-overflow -fno-tree-dominator-opts -fno-tree-loop-optimize -fno-tree-reassoc -fno-tree-sink" },
  { reference_name : "OPT12" , value : "-O2 -fno-ivopts -fpeel-loops -fschedule-insns" },
  { reference_name : "OPT13" , value : "-O2 -fno-tree-loop-im -fno-tree-pre" },
  { reference_name : "OPT14" , value : "-O3 -falign-loops -fno-caller-saves -fno-cprop-registers -fno-if-conversion -fno-ivopts -freorder-blocks-and-partition -fno-tree-pre -funroll-all-loops" },
  { reference_name : "OPT15" , value : "-O3 -falign-loops -fno-cprop-registers -fno-if-conversion -fno-peephole2 -funroll-all-loops" },
  { reference_name : "OPT16" , value : "-O3 -falign-loops -fno-delete-null-pointer-checks -fno-gcse-lm -floop-interchange -fsched2-use-superblocks -fno-tree-pre -fno-tree-vectorize -funroll-all-loops -funsafe-loop-optimizations -fno-web" },
  { reference_name : "OPT17" , value : "-O3 -fno-gcse -floop-strip-mine -fno-move-loop-invariants -fno-predictive-commoning -ftracer" },
  { reference_name : "OPT18" , value : "-O3 -fno-inline-functions-called-once -fno-regmove -frename-registers -fno-tree-copyrename" },
  { reference_name : "OPT19" , value : "-O3 -fno-inline-functions -fno-move-loop-invariants" },
]

function get_directory_logs(){
  return process.env.directory_log ? process.env.directory_log : `${__dirname}/logs`
}

async function try_ck_run_program(program, input, count){
  count = count || 0;
  
  try {
    const { stdout } = await exec(`ck run program:${program} ${input ? input.value : ""}`, { maxBuffer : maxBuffer});
    if (!stdout.match('Execution time')){
      throw new Error(stdout);
    }
    return stdout;
  } catch(e){
    if (count <= 10){
      return try_ck_run_program(program, input, ++count)
    }

    throw e;
  }
}

async function run_program_with_optimization(program, optimization, input){
  console.log(`Running program ${input && input.name ? input.name : program} with optimizations ${optimization.reference_name} for ${total_execution} times`)
  let directory = get_directory_logs().concat(`/${program}/${input && input.name ? input.name.concat("/") : ""}${optimization.reference_name}`);
  await exec(`mkdir ${directory}`);
  await exec(`ck compile program:${program} --flags="${optimization.value}" --compiler_tags=milepost`, { maxBuffer : maxBuffer});
  await exec(`ck run program:${program} ${input ? input.value : ""}`, { maxBuffer : maxBuffer}); //warm up cache
  let executions_time = [];
  for (let execution = 0; execution < total_execution; execution++) {
    //const stdout  = await try_ck_run_program(program, input);
    const { stdout } = await exec(`ck run program:${program} ${input ? input.value : ""}`, { maxBuffer : maxBuffer});
    fs.writeFileSync(directory.concat(`/execution${new Number(execution + 1).toString().padStart(2, '0')}.txt`), stdout);
    if (!stdout.match('Normalized execution time')){
      continue;
    }
    let execution_time = stdout.match('(Normalized execution time\: )([0-9]*\.[0-9]*)')[2];
    executions_time.push(+execution_time);
  }

  let summary = `sum: ${stats.sum(executions_time)}\n` +
  `mean: ${stats.mean(executions_time)}\n` +
  `median: ${stats.median(executions_time)}\n` +
  `variance: ${stats.variance(executions_time)}\n` +
  `standard deviation: ${stats.stdev(executions_time)}\n` +
  `sample standard deviation: ${stats.sampleStdev(executions_time)}`
  
  console.log(`summary ${program} program:\n${summary}`);

  fs.writeFileSync(directory.concat('/summary.txt'), summary);
  return stats.mean(executions_time);
}

async function run_program(program){
  await exec(`mkdir ${get_directory_logs().concat(`/${program}`)}`);
  let program_inputs = inputs.filter(e => e.program === program);
  if (program_inputs.length) {
    for (let input of program_inputs) {
      let directory_input = get_directory_logs().concat(`/${program}`);
      if (input.name) {
        directory_input = get_directory_logs().concat(`/${program}/${input.name}`);
        await exec(`mkdir ${directory_input}`);
      }

      let best_optimization = {name : 'None', result: Infinity};
      for (let optimization of optimizations){
        let result_optimization = await run_program_with_optimization(program, optimization, input);
        if (result_optimization < best_optimization.result){
          best_optimization = {name : optimization.reference_name, result : result_optimization}
        }
      }

      fs.writeFileSync(directory_input.concat('/best_op.txt'), 
        `The best optimization is ${best_optimization.name} with ${best_optimization.result} sec`);
    }  
  } else {
    let best_optimization = {name : 'None', result: Infinity};
    for (let optimization of optimizations){
      let result_optimization = await run_program_with_optimization(program, optimization);
      if (result_optimization < best_optimization.result){
        best_optimization = {name : optimization.reference_name, result : result_optimization}
      }
    }

    fs.writeFileSync(get_directory_logs().concat(`/${program}`).concat('/best_op.txt'), 
        `The best optimization is ${best_optimization.name} with ${best_optimization.result} sec`);
  }

}

async function run(){
  if (fs.existsSync(get_directory_logs())) {
    console.log('Log directory already exists, please remove before run this module');
    return;
  }

  await exec(`mkdir ${get_directory_logs()}`);
  for (let program of programs) {
    await run_program(program);
  }
}

run();