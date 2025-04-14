export const resizeImage = async (file: File) => {
    return new Promise<File>((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const MAX_WIDTH = 1080;
            const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;

            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(
                            new File([blob], file.name, {
                                type: file.type,
                            })
                        );
                    } else {
                        reject(new Error("Image resizing failed."));
                    }
                },
                file.type,
                0.9 // Quality for JPEG images
            );
        };

        img.onerror = () => reject(new Error("Failed to load image."));
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
    });
};
