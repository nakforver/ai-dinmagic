let progressInterval = undefined;
if (progressInterval) // clearInterval(progressInterval);
setTimeout(() => {
    console.log("This will never run!");
}, 1000);
console.log("End of script");
