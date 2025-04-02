import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// const ffmpeg = new FFmpeg();

export const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    // const ffmpeg = ffmpegRef.current;
    // ffmpeg.on("log", ({ message }) => {
    //     // messageRef.current.innerHTML = message;
    //     console.log(message);
    // });
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
        coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            "text/javascript"
        ),
        wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            "application/wasm"
        ),
    });
    return ffmpeg;
    // setLoaded(true);
};

export const transcode = async (ffmpeg: FFmpeg, file: File) => {
    // const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile(
        file.name,
        await fetchFile(file)
        // "https://raw.githubusercontent.com/ffmpegwasm/testdata/master/Big_Buck_Bunny_180_10s.webm"
    );
    const outputFileName = `output.${file.name.split(".").pop()}`;
    await ffmpeg.exec([
        "-i",
        file.name,
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        outputFileName,
    ]);
    const data = await ffmpeg.readFile(outputFileName);
    return new File([data], outputFileName, { type: file.type });
    // return new File(new Blob([data], { type: file.type }), outputFileName);
};

// if (values.type === "video") {
//     const ffmpeg = createFFmpeg({
//         log: true,
//         corePath: "https://unpkg.com/@ffmpeg/core@0.11.6/dist/ffmpeg-core.js",
//     });
//     await ffmpeg.load();
//     const file = values.files[0];
//     const ext = file.name.split(".").pop();
//     await ffmpeg.FS("writeFile", file.name, await fetchFile(file));
//     await ffmpeg.run([
//         "-i",
//         file.name,
//         "-c:v",
//         "libx264",
//         "-c:a",
//         "aac",
//         "-b:a",
//         "128k",
//         `output.${ext}`,
//     ]);
//     const data = await ffmpeg.FS("readFile", `output.${ext}`);
//     const blob = new Blob([data], { type: file.type });
//     videoFile = new File([blob], `output.${ext}`, {
//         type: file.type,
//     });
// }
