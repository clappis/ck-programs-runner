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
] 

const total_execution = 10;
const maxBuffer = 1024000;

const skip_calibration = true;

const datasets = [
  { program : "cbench-automotive-bitcount", value: "--dataset_uoa=number-0001", name: "dataset1"},
  { program : "cbench-automotive-bitcount", value: "--dataset_uoa=number-0002", name: "dataset2"},
  { program : "cbench-automotive-bitcount", value: "--dataset_uoa=number-0003", name: "dataset3"},
  { program : "cbench-automotive-bitcount", value: "--dataset_uoa=number-0004", name: "dataset4"},
  { program : "cbench-automotive-bitcount", value: "--dataset_uoa=number-0005", name: "dataset5"}, 

  { program : "cbench-automotive-qsort1", value: "--dataset_uoa=cdataset-qsort-0001", name: "dataset1"},
  { program : "cbench-automotive-qsort1", value: "--dataset_uoa=cdataset-qsort-0002", name: "dataset2"},
  { program : "cbench-automotive-qsort1", value: "--dataset_uoa=cdataset-qsort-0003", name: "dataset3"},
  { program : "cbench-automotive-qsort1", value: "--dataset_uoa=cdataset-qsort-0004", name: "dataset4"},
  { program : "cbench-automotive-qsort1", value: "--dataset_uoa=cdataset-qsort-0005", name: "dataset5"},

  { program : "cbench-automotive-susan", value: "--dataset_uoa=image-pgm-0001", name: "dataset1" , input: "edges"},
  { program : "cbench-automotive-susan", value: "--dataset_uoa=image-pgm-0002", name: "dataset2", input: "edges"},
  { program : "cbench-automotive-susan", value: "--dataset_uoa=image-pgm-0003", name: "dataset3" , input: "edges"},
  { program : "cbench-automotive-susan", value: "--dataset_uoa=image-pgm-0004", name: "dataset4", input: "edges"},
  { program : "cbench-automotive-susan", value: "--dataset_uoa=image-pgm-0005", name: "dataset5", input: "edges"},
  
  { program : "cbench-automotive-susan", value: "--dataset_uoa=image-pgm-0001", name: "dataset1" , input: "corners"},
  { program : "cbench-automotive-susan", value: "--dataset_uoa=image-pgm-0002", name: "dataset2", input: "corners"},
  { program : "cbench-automotive-susan", value: "--dataset_uoa=image-pgm-0003", name: "dataset3" , input: "corners"},
  { program : "cbench-automotive-susan", value: "--dataset_uoa=image-pgm-0004", name: "dataset4", input: "corners"},
  { program : "cbench-automotive-susan", value: "--dataset_uoa=image-pgm-0005", name: "dataset5", input: "corners"},

  { program : "cbench-automotive-susan", value: "--dataset_uoa=image-pgm-0001", name: "dataset1" , input: "smoothing"},
  { program : "cbench-automotive-susan", value: "--dataset_uoa=image-pgm-0002", name: "dataset2", input: "smoothing"},
  { program : "cbench-automotive-susan", value: "--dataset_uoa=image-pgm-0003", name: "dataset3" , input: "smoothing"},
  { program : "cbench-automotive-susan", value: "--dataset_uoa=image-pgm-0004", name: "dataset4", input: "smoothing"},
  { program : "cbench-automotive-susan", value: "--dataset_uoa=image-pgm-0005", name: "dataset5", input: "smoothing"},

  { program : "cbench-bzip2", value: "--dataset_uoa=bzip2-0001", name: "dataset1" , input: "decode"},
  { program : "cbench-bzip2", value: "--dataset_uoa=bzip2-0002", name: "dataset2" , input: "decode"},
  { program : "cbench-bzip2", value: "--dataset_uoa=bzip2-0003", name: "dataset3" , input: "decode"},
  { program : "cbench-bzip2", value: "--dataset_uoa=bzip2-0004", name: "dataset4" , input: "decode"},
  { program : "cbench-bzip2", value: "--dataset_uoa=bzip2-0005", name: "dataset5" , input: "decode"},

  { program : "cbench-bzip2", value: "--dataset_file=\"data.txt\" env.dataset_filename_1=data.txt --dataset_uoa=txt-0001", name: "dataset1" , input: "encode"},
  { program : "cbench-bzip2", value: "--dataset_file=\"data.txt\" env.dataset_filename_1=data.txt --dataset_uoa=txt-0002", name: "dataset2" , input: "encode"},
  { program : "cbench-bzip2", value: "--dataset_file=\"data.txt\" env.dataset_filename_1=data.txt --dataset_uoa=txt-0003", name: "dataset3" , input: "encode"},
  { program : "cbench-bzip2", value: "--dataset_file=\"data.txt\" env.dataset_filename_1=data.txt --dataset_uoa=txt-0004", name: "dataset4" , input: "encode"},
  { program : "cbench-bzip2", value: "--dataset_file=\"data.txt\" env.dataset_filename_1=data.txt --dataset_uoa=txt-0005", name: "dataset5" , input: "encode"}, 


  { program : "cbench-consumer-jpeg-c", value: "--dataset_uoa=image-ppm-0001", name: "dataset1"},
  { program : "cbench-consumer-jpeg-c", value: "--dataset_uoa=image-ppm-0002", name: "dataset2"},
  { program : "cbench-consumer-jpeg-c", value: "--dataset_uoa=image-ppm-0003", name: "dataset3"},
  { program : "cbench-consumer-jpeg-c", value: "--dataset_uoa=image-ppm-0004", name: "dataset4"},
  { program : "cbench-consumer-jpeg-c", value: "--dataset_uoa=image-ppm-0005", name: "dataset5"},

  { program : "cbench-consumer-jpeg-d", value: "--dataset_uoa=image-jpeg-0001", name: "dataset1"},
  { program : "cbench-consumer-jpeg-d", value: "--dataset_uoa=image-jpeg-0002", name: "dataset2"},
  { program : "cbench-consumer-jpeg-d", value: "--dataset_uoa=image-jpeg-0003", name: "dataset3"},
  { program : "cbench-consumer-jpeg-d", value: "--dataset_uoa=image-jpeg-0004", name: "dataset4"},
  { program : "cbench-consumer-jpeg-d", value: "--dataset_uoa=image-jpeg-0005", name: "dataset5"},

  { program : "cbench-consumer-tiff2bw", value: "--dataset_uoa=image-tiff-0001", name: "dataset1"},
  { program : "cbench-consumer-tiff2bw", value: "--dataset_uoa=image-tiff-0002", name: "dataset2"},
  { program : "cbench-consumer-tiff2bw", value: "--dataset_uoa=image-tiff-0003", name: "dataset3"},
  { program : "cbench-consumer-tiff2bw", value: "--dataset_uoa=image-tiff-0004", name: "dataset4"},
  { program : "cbench-consumer-tiff2bw", value: "--dataset_uoa=image-tiff-0005", name: "dataset5"},
  
  { program : "cbench-consumer-tiff2dither", value: "--dataset_uoa=image-tiff-0001-bw", name: "dataset1"},
  { program : "cbench-consumer-tiff2dither", value: "--dataset_uoa=image-tiff-0002-bw", name: "dataset2"},
  { program : "cbench-consumer-tiff2dither", value: "--dataset_uoa=image-tiff-0003-bw", name: "dataset3"},
  { program : "cbench-consumer-tiff2dither", value: "--dataset_uoa=image-tiff-0004-bw", name: "dataset4"},
  { program : "cbench-consumer-tiff2dither", value: "--dataset_uoa=image-tiff-0005-bw", name: "dataset5"},

  { program : "cbench-consumer-tiff2median", value: "--dataset_uoa=image-tiff-0001-bw", name: "dataset1"},
  { program : "cbench-consumer-tiff2median", value: "--dataset_uoa=image-tiff-0002-bw", name: "dataset2"},
  { program : "cbench-consumer-tiff2median", value: "--dataset_uoa=image-tiff-0003-bw", name: "dataset3"},
  { program : "cbench-consumer-tiff2median", value: "--dataset_uoa=image-tiff-0004-bw", name: "dataset4"},
  { program : "cbench-consumer-tiff2median", value: "--dataset_uoa=image-tiff-0005-bw", name: "dataset5"},

  { program : "cbench-consumer-tiff2rgba", value: "--dataset_uoa=image-tiff-0001", name: "dataset1"},
  { program : "cbench-consumer-tiff2rgba", value: "--dataset_uoa=image-tiff-0002", name: "dataset2"},
  { program : "cbench-consumer-tiff2rgba", value: "--dataset_uoa=image-tiff-0003", name: "dataset3"},
  { program : "cbench-consumer-tiff2rgba", value: "--dataset_uoa=image-tiff-0004", name: "dataset4"},
  { program : "cbench-consumer-tiff2rgba", value: "--dataset_uoa=image-tiff-0005", name: "dataset5"},
  
  { program : "cbench-network-dijkstra", value: "--dataset_uoa=cdataset-dijkstra-0001", name: "dataset1"},
  { program : "cbench-network-dijkstra", value: "--dataset_uoa=cdataset-dijkstra-0002", name: "dataset2"},
  { program : "cbench-network-dijkstra", value: "--dataset_uoa=cdataset-dijkstra-0003", name: "dataset3"},
  { program : "cbench-network-dijkstra", value: "--dataset_uoa=cdataset-dijkstra-0004", name: "dataset4"},
  { program : "cbench-network-dijkstra", value: "--dataset_uoa=cdataset-dijkstra-0005", name: "dataset5"},

  { program : "cbench-network-patricia", value: "--dataset_uoa=cdataset-patricia-0001", name: "dataset1"},
  { program : "cbench-network-patricia", value: "--dataset_uoa=cdataset-patricia-0002", name: "dataset2"},
  { program : "cbench-network-patricia", value: "--dataset_uoa=cdataset-patricia-0003", name: "dataset3"},
  { program : "cbench-network-patricia", value: "--dataset_uoa=cdataset-patricia-0004", name: "dataset4"},
  { program : "cbench-network-patricia", value: "--dataset_uoa=cdataset-patricia-0005", name: "dataset5"},


  { program : "cbench-office-stringsearch2", value: "--dataset_file=\"data.txt\" env.dataset_filename_1=data.txt --dataset_uoa=txt-0001", name: "dataset1"},
  { program : "cbench-office-stringsearch2", value: "--dataset_file=\"data.txt\" env.dataset_filename_1=data.txt --dataset_uoa=txt-0002", name: "dataset2"},
  { program : "cbench-office-stringsearch2", value: "--dataset_file=\"data.txt\" env.dataset_filename_1=data.txt --dataset_uoa=txt-0003", name: "dataset3"},
  { program : "cbench-office-stringsearch2", value: "--dataset_file=\"data.txt\" env.dataset_filename_1=data.txt --dataset_uoa=txt-0007", name: "dataset4"},
  { program : "cbench-office-stringsearch2", value: "--dataset_file=\"data.txt\" env.dataset_filename_1=data.txt --dataset_uoa=txt-0005", name: "dataset5"},

  { program : "cbench-security-rijndael", value: "--dataset_uoa=enc-0001", name: "dataset1", input: "decode"},
  { program : "cbench-security-rijndael", value: "--dataset_uoa=enc-0002", name: "dataset2", input: "decode"},
  { program : "cbench-security-rijndael", value: "--dataset_uoa=enc-0003", name: "dataset3", input: "decode"},
  { program : "cbench-security-rijndael", value: "--dataset_uoa=enc-0004", name: "dataset4", input: "decode"},
  { program : "cbench-security-rijndael", value: "--dataset_uoa=enc-0005", name: "dataset5", input: "decode"},

  { program : "cbench-security-rijndael", value: "--dataset_uoa=enc-0001", name: "dataset1", input: "encode"},
  { program : "cbench-security-rijndael", value: "--dataset_uoa=enc-0002", name: "dataset2", input: "encode"},
  { program : "cbench-security-rijndael", value: "--dataset_uoa=enc-0003", name: "dataset3", input: "encode"},
  { program : "cbench-security-rijndael", value: "--dataset_uoa=enc-0004", name: "dataset4", input: "encode"},
  { program : "cbench-security-rijndael", value: "--dataset_uoa=enc-0005", name: "dataset5", input: "encode"},

  { program : "cbench-security-sha", value: "--dataset_uoa=adpcm-0001", name: "dataset1"},
  { program : "cbench-security-sha", value: "--dataset_uoa=adpcm-0002", name: "dataset2"},
  { program : "cbench-security-sha", value: "--dataset_uoa=adpcm-0003", name: "dataset3"},
  { program : "cbench-security-sha", value: "--dataset_uoa=adpcm-0007", name: "dataset4"},
  { program : "cbench-security-sha", value: "--dataset_uoa=adpcm-0005", name: "dataset5"},

  { program : "cbench-telecom-adpcm-c", value: "--dataset_uoa=pcm-0001", name: "dataset1"},
  { program : "cbench-telecom-adpcm-c", value: "--dataset_uoa=pcm-0002", name: "dataset2"},
  { program : "cbench-telecom-adpcm-c", value: "--dataset_uoa=pcm-0003", name: "dataset3"},
  { program : "cbench-telecom-adpcm-c", value: "--dataset_uoa=pcm-0004", name: "dataset4"},
  { program : "cbench-telecom-adpcm-c", value: "--dataset_uoa=pcm-0005", name: "dataset5"},

  { program : "cbench-telecom-adpcm-d", value: "--dataset_uoa=adpcm-0001", name: "dataset1"},
  { program : "cbench-telecom-adpcm-d", value: "--dataset_uoa=adpcm-0002", name: "dataset2"},
  { program : "cbench-telecom-adpcm-d", value: "--dataset_uoa=adpcm-0003", name: "dataset3"},
  { program : "cbench-telecom-adpcm-d", value: "--dataset_uoa=adpcm-0004", name: "dataset4"},
  { program : "cbench-telecom-adpcm-d", value: "--dataset_uoa=adpcm-0005", name: "dataset5"},

  { program : "cbench-telecom-crc32", value: "--dataset_uoa=adpcm-0001", name: "dataset1"},
  { program : "cbench-telecom-crc32", value: "--dataset_uoa=adpcm-0002", name: "dataset2"},
  { program : "cbench-telecom-crc32", value: "--dataset_uoa=adpcm-0003", name: "dataset3"},
  { program : "cbench-telecom-crc32", value: "--dataset_uoa=adpcm-0004", name: "dataset4"},
  { program : "cbench-telecom-crc32", value: "--dataset_uoa=adpcm-0005", name: "dataset5"},

  { program : "cbench-telecom-gsm", value: "--dataset_uoa=au-0001", name: "dataset1"},
  { program : "cbench-telecom-gsm", value: "--dataset_uoa=au-0002", name: "dataset2"},
  { program : "cbench-telecom-gsm", value: "--dataset_uoa=au-0003", name: "dataset3"},
  { program : "cbench-telecom-gsm", value: "--dataset_uoa=au-0004", name: "dataset4"},
  { program : "cbench-telecom-gsm", value: "--dataset_uoa=au-0005", name: "dataset5"},

  { program : "polybench-cpu-3mm", compilation : true, value: "@polybench_dataset/polybench-cpu-3mm/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-3mm", compilation : true, value: "@polybench_dataset/polybench-cpu-3mm/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-3mm", compilation : true, value: "@polybench_dataset/polybench-cpu-3mm/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-3mm", compilation : true, value: "@polybench_dataset/polybench-cpu-3mm/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-trmm", compilation : true, value: "@polybench_dataset/polybench-cpu-trmm/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-trmm", compilation : true, value: "@polybench_dataset/polybench-cpu-trmm/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-trmm", compilation : true, value: "@polybench_dataset/polybench-cpu-trmm/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-trmm", compilation : true, value: "@polybench_dataset/polybench-cpu-trmm/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-lu", compilation : true, value: "@polybench_dataset/polybench-cpu-lu/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-lu", compilation : true, value: "@polybench_dataset/polybench-cpu-lu/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-lu", compilation : true, value: "@polybench_dataset/polybench-cpu-lu/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-lu", compilation : true, value: "@polybench_dataset/polybench-cpu-lu/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-doitgen", compilation : true, value: "@polybench_dataset/polybench-cpu-doitgen/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-doitgen", compilation : true, value: "@polybench_dataset/polybench-cpu-doitgen/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-doitgen", compilation : true, value: "@polybench_dataset/polybench-cpu-doitgen/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-doitgen", compilation : true, value: "@polybench_dataset/polybench-cpu-doitgen/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-jacobi-2d-imper", compilation : true, value: "@polybench_dataset/polybench-cpu-jacobi-2d-imper/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-jacobi-2d-imper", compilation : true, value: "@polybench_dataset/polybench-cpu-jacobi-2d-imper/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-jacobi-2d-imper", compilation : true, value: "@polybench_dataset/polybench-cpu-jacobi-2d-imper/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-jacobi-2d-imper", compilation : true, value: "@polybench_dataset/polybench-cpu-jacobi-2d-imper/dataset4.json", name: "dataset4"},
  
  { program : "polybench-cpu-fdtd-2d", compilation : true, value: "@polybench_dataset/polybench-cpu-fdtd-2d/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-fdtd-2d", compilation : true, value: "@polybench_dataset/polybench-cpu-fdtd-2d/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-fdtd-2d", compilation : true, value: "@polybench_dataset/polybench-cpu-fdtd-2d/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-fdtd-2d", compilation : true, value: "@polybench_dataset/polybench-cpu-fdtd-2d/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-symm", compilation : true, value: "@polybench_dataset/polybench-cpu-symm/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-symm", compilation : true, value: "@polybench_dataset/polybench-cpu-symm/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-symm", compilation : true, value: "@polybench_dataset/polybench-cpu-symm/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-symm", compilation : true, value: "@polybench_dataset/polybench-cpu-symm/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-atax", compilation : true, value: "@polybench_dataset/polybench-cpu-atax/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-atax", compilation : true, value: "@polybench_dataset/polybench-cpu-atax/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-atax", compilation : true, value: "@polybench_dataset/polybench-cpu-atax/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-atax", compilation : true, value: "@polybench_dataset/polybench-cpu-atax/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-bicg", compilation : true, value: "@polybench_dataset/polybench-cpu-bicg/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-bicg", compilation : true, value: "@polybench_dataset/polybench-cpu-bicg/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-bicg", compilation : true, value: "@polybench_dataset/polybench-cpu-bicg/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-bicg", compilation : true, value: "@polybench_dataset/polybench-cpu-bicg/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-adi", compilation : true, value: "@polybench_dataset/polybench-cpu-adi/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-adi", compilation : true, value: "@polybench_dataset/polybench-cpu-adi/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-adi", compilation : true, value: "@polybench_dataset/polybench-cpu-adi/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-adi", compilation : true, value: "@polybench_dataset/polybench-cpu-adi/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-gemm", compilation : true, value: "@polybench_dataset/polybench-cpu-gemm/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-gemm", compilation : true, value: "@polybench_dataset/polybench-cpu-gemm/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-gemm", compilation : true, value: "@polybench_dataset/polybench-cpu-gemm/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-gemm", compilation : true, value: "@polybench_dataset/polybench-cpu-gemm/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-jacobi-1d-imper", compilation : true, value: "@polybench_dataset/polybench-cpu-jacobi-1d-imper/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-jacobi-1d-imper", compilation : true, value: "@polybench_dataset/polybench-cpu-jacobi-1d-imper/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-jacobi-1d-imper", compilation : true, value: "@polybench_dataset/polybench-cpu-jacobi-1d-imper/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-jacobi-1d-imper", compilation : true, value: "@polybench_dataset/polybench-cpu-jacobi-1d-imper/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-gramschmidt", compilation : true, value: "@polybench_dataset/polybench-cpu-gramschmidt/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-gramschmidt", compilation : true, value: "@polybench_dataset/polybench-cpu-gramschmidt/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-gramschmidt", compilation : true, value: "@polybench_dataset/polybench-cpu-gramschmidt/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-gramschmidt", compilation : true, value: "@polybench_dataset/polybench-cpu-gramschmidt/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-fdtd-apml", compilation : true, value: "@polybench_dataset/polybench-cpu-fdtd-apml/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-fdtd-apml", compilation : true, value: "@polybench_dataset/polybench-cpu-fdtd-apml/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-fdtd-apml", compilation : true, value: "@polybench_dataset/polybench-cpu-fdtd-apml/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-fdtd-apml", compilation : true, value: "@polybench_dataset/polybench-cpu-fdtd-apml/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-ludcmp", compilation : true, value: "@polybench_dataset/polybench-cpu-ludcmp/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-ludcmp", compilation : true, value: "@polybench_dataset/polybench-cpu-ludcmp/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-ludcmp", compilation : true, value: "@polybench_dataset/polybench-cpu-ludcmp/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-ludcmp", compilation : true, value: "@polybench_dataset/polybench-cpu-ludcmp/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-trisolv", compilation : true, value: "@polybench_dataset/polybench-cpu-trisolv/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-trisolv", compilation : true, value: "@polybench_dataset/polybench-cpu-trisolv/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-trisolv", compilation : true, value: "@polybench_dataset/polybench-cpu-trisolv/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-trisolv", compilation : true, value: "@polybench_dataset/polybench-cpu-trisolv/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-gesummv", compilation : true, value: "@polybench_dataset/polybench-cpu-gesummv/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-gesummv", compilation : true, value: "@polybench_dataset/polybench-cpu-gesummv/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-gesummv", compilation : true, value: "@polybench_dataset/polybench-cpu-gesummv/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-gesummv", compilation : true, value: "@polybench_dataset/polybench-cpu-gesummv/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-mvt", compilation : true, value: "@polybench_dataset/polybench-cpu-mvt/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-mvt", compilation : true, value: "@polybench_dataset/polybench-cpu-mvt/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-mvt", compilation : true, value: "@polybench_dataset/polybench-cpu-mvt/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-mvt", compilation : true, value: "@polybench_dataset/polybench-cpu-mvt/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-syr2k", compilation : true, value: "@polybench_dataset/polybench-cpu-syr2k/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-syr2k", compilation : true, value: "@polybench_dataset/polybench-cpu-syr2k/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-syr2k", compilation : true, value: "@polybench_dataset/polybench-cpu-syr2k/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-syr2k", compilation : true, value: "@polybench_dataset/polybench-cpu-syr2k/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-cholesky", compilation : true, value: "@polybench_dataset/polybench-cpu-cholesky/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-cholesky", compilation : true, value: "@polybench_dataset/polybench-cpu-cholesky/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-cholesky", compilation : true, value: "@polybench_dataset/polybench-cpu-cholesky/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-cholesky", compilation : true, value: "@polybench_dataset/polybench-cpu-cholesky/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-dynprog", compilation : true, value: "@polybench_dataset/polybench-cpu-dynprog/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-dynprog", compilation : true, value: "@polybench_dataset/polybench-cpu-dynprog/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-dynprog", compilation : true, value: "@polybench_dataset/polybench-cpu-dynprog/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-dynprog", compilation : true, value: "@polybench_dataset/polybench-cpu-dynprog/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-medley-reg-detect", compilation : true, value: "@polybench_dataset/polybench-cpu-medley-reg-detect/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-medley-reg-detect", compilation : true, value: "@polybench_dataset/polybench-cpu-medley-reg-detect/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-medley-reg-detect", compilation : true, value: "@polybench_dataset/polybench-cpu-medley-reg-detect/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-medley-reg-detect", compilation : true, value: "@polybench_dataset/polybench-cpu-medley-reg-detect/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-medley-floyd-warshall", compilation : true, value: "@polybench_dataset/polybench-cpu-medley-floyd-warshall/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-medley-floyd-warshall", compilation : true, value: "@polybench_dataset/polybench-cpu-medley-floyd-warshall/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-medley-floyd-warshall", compilation : true, value: "@polybench_dataset/polybench-cpu-medley-floyd-warshall/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-medley-floyd-warshall", compilation : true, value: "@polybench_dataset/polybench-cpu-medley-floyd-warshall/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-syrk", compilation : true, value: "@polybench_dataset/polybench-cpu-syrk/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-syrk", compilation : true, value: "@polybench_dataset/polybench-cpu-syrk/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-syrk", compilation : true, value: "@polybench_dataset/polybench-cpu-syrk/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-syrk", compilation : true, value: "@polybench_dataset/polybench-cpu-syrk/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-2mm", compilation : true, value: "@polybench_dataset/polybench-cpu-2mm/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-2mm", compilation : true, value: "@polybench_dataset/polybench-cpu-2mm/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-2mm", compilation : true, value: "@polybench_dataset/polybench-cpu-2mm/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-2mm", compilation : true, value: "@polybench_dataset/polybench-cpu-2mm/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-seidel-2d", compilation : true, value: "@polybench_dataset/polybench-cpu-seidel-2d/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-seidel-2d", compilation : true, value: "@polybench_dataset/polybench-cpu-seidel-2d/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-seidel-2d", compilation : true, value: "@polybench_dataset/polybench-cpu-seidel-2d/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-seidel-2d", compilation : true, value: "@polybench_dataset/polybench-cpu-seidel-2d/dataset4.json", name: "dataset4"},

  { program : "polybench-cpu-gemver", compilation : true, value: "@polybench_dataset/polybench-cpu-gemver/dataset1.json", name: "dataset1"},
  { program : "polybench-cpu-gemver", compilation : true, value: "@polybench_dataset/polybench-cpu-gemver/dataset2.json", name: "dataset2"},
  { program : "polybench-cpu-gemver", compilation : true, value: "@polybench_dataset/polybench-cpu-gemver/dataset3.json", name: "dataset3"},
  { program : "polybench-cpu-gemver", compilation : true, value: "@polybench_dataset/polybench-cpu-gemver/dataset4.json", name: "dataset4"},
]

const inputs = [
  { program : "cbench-automotive-susan", value: "--cmd_key=edges", name: "edges"},
  { program : "cbench-automotive-susan", value: "--cmd_key=corners", name : "corners"},
  { program : "cbench-automotive-susan", value: "--cmd_key=smoothing", name : "smoothing"},
  { program : "cbench-bzip2", value: "--cmd_key=decode", name : "decode"},
  { program : "cbench-bzip2", value: "--cmd_key=encode", name : "encode"},
  { program : "cbench-security-rijndael", value: "--cmd_key=encode", name : "encode"},
  { program : "cbench-security-rijndael", value: "--cmd_key=decode", name : "decode"}
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
  { reference_name : "OPT19" , value : "-O3 -fno-inline-functions -fno-move-loop-invariants" }
]

function get_directory_logs(){
  return process.env.directory_log ? process.env.directory_log : `${__dirname}/logs`
}

function get_regex(){
  return skip_calibration ? `(\"execution_time\"\: )(.*),` : `("Normalized execution time"\: )([0-9]*\.[0-9]*)`;
}

function log(program, optimization, input, dataset, directory_base){
  console.log(`Running program ${program} with:`)
  if (input && input.name) {
    console.log(`Input name: ${input.name}`)
  }
  if (dataset){
    console.log(`Dataset: ${dataset.name} / ${dataset.value}`)
  }
  console.log(`With optimization ${optimization.reference_name} for ${total_execution} times\n`);
}

async function run_program_with_optimization(program, optimization, input, dataset, directory_base){
  log(program, optimization, input, dataset, directory_base);

  let directory = directory_base.concat(`/${optimization.reference_name}`);
  await exec(`mkdir ${directory}`);
  const result_compilation = await exec(`ck compile program:${program} ${dataset && dataset.compilation ? dataset.value : ""} --flags="${optimization.value}" --compiler_tags=milepost`, { maxBuffer : maxBuffer});
  fs.writeFileSync(directory.concat('/compilation.txt'), result_compilation.stdout);
  await exec(`ck run program:${program} ${input ? input.value : ""} ${dataset && !dataset.compilation ? dataset.value : ""} ${skip_calibration ? "--skip_calibration" : ""}   `, { maxBuffer : maxBuffer}); //warm up cache
  let executions_time = [];
  for (let execution = 0; execution < total_execution; execution++) {
    const { stdout } = await exec(`ck run program:${program} ${input ? input.value : ""} ${dataset && !dataset.compilation ? dataset.value : ""} ${skip_calibration ? "--skip_calibration" : ""} --skip_output_validation`, { maxBuffer : maxBuffer});
    fs.writeFileSync(directory.concat(`/execution${new Number(execution + 1).toString().padStart(2, '0')}.txt`), stdout);
    if (!stdout.match(get_regex())){
      continue;
    }

    let execution_time = stdout.match(get_regex())[2];
    executions_time.push(+execution_time);
  }

  let summary = `sum: ${stats.sum(executions_time)}\n` +
  `mean: ${stats.mean(executions_time)}\n` +
  `median: ${stats.median(executions_time)}\n` +
  `variance: ${stats.variance(executions_time)}\n` +
  `standard deviation: ${stats.stdev(executions_time)}\n` +
  `sample standard deviation: ${stats.sampleStdev(executions_time)}`
  
  console.log(`summary ${program} program:\n${summary}\n`);
  console.log('---------------------------------------------------------------------------\n\n')

  fs.writeFileSync(directory.concat('/summary.txt'), summary);
  return { 
    mean: stats.mean(executions_time),
    standard_deviation : stats.stdev(executions_time)
  };
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

      
      const program_datasets = datasets.filter(e => e.program === program && e.input === input.name);
      for (const dataset of program_datasets){
        let best_optimization = {name : 'None', result: { mean : Infinity, standard_deviation: 0}};
        let directory_dataset = directory_input.concat(`/${dataset.name}`);
        await exec(`mkdir ${directory_dataset}`);
        let all_results = [];
        for (let optimization of optimizations){
          let result_optimization = await run_program_with_optimization(program, optimization, input, dataset, directory_dataset);
          all_results.push({name: optimization.reference_name, result: result_optimization});
          if (result_optimization.mean < best_optimization.result.mean){
            best_optimization = {name : optimization.reference_name, result : result_optimization}
          }
        }
  
        let all_results_except_best = all_results.filter(e => e.name != best_optimization.name);
        let ties = all_results_except_best.filter(e => e.result.mean - e.result.standard_deviation <= 
                    best_optimization.result.mean + best_optimization.result.standard_deviation);

        let result_text = `The best optimization group is ${best_optimization.name} with ${best_optimization.result.mean} sec`;
        if (ties.length){
          result_text += `\nTecnical tie: ${ties.map(e => e.name).join()} with ${ties.map(e => e.result.mean).join()} respectively`
        }
        
        fs.writeFileSync(directory_dataset.concat('/best_op.txt'), result_text); 
      }

    }  
  } else {
    let directory_base = get_directory_logs().concat(`/${program}`);

    const program_datasets = datasets.filter(e => e.program === program);
    for (const dataset of program_datasets){
      let best_optimization = {name : 'None', result: { mean : Infinity, standard_deviation: 0}};
      let directory_dataset = directory_base.concat(`/${dataset.name}`);
      let all_results = [];
      await exec(`mkdir ${directory_dataset}`);
      for (let optimization of optimizations){
        let result_optimization = await run_program_with_optimization(program, optimization, undefined, dataset, directory_dataset);
        all_results.push({name: optimization.reference_name, result: result_optimization});
        if (result_optimization.mean < best_optimization.result.mean){
          best_optimization = {name : optimization.reference_name, result : result_optimization}
        }
      }

      let all_results_except_best = all_results.filter(e => e.name != best_optimization.name);
      let ties = all_results_except_best.filter(e => e.result.mean - e.result.standard_deviation <= 
                    best_optimization.result.mean + best_optimization.result.standard_deviation);

      let result_text = `The best optimization group is ${best_optimization.name} with ${best_optimization.result.mean} sec`;
      if (ties.length){
        result_text += `\nTecnical tie: ${ties.map(e => e.name).join()} with ${ties.map(e => e.result.mean).join()} respectively`
      }
      
      fs.writeFileSync(directory_dataset.concat('/best_op.txt'), result_text); 
     }

    
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


