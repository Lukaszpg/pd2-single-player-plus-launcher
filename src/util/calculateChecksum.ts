import { fixedResourcePath } from "./fixedResourcePath";
import { readBinaryFile } from "@tauri-apps/api/fs";

export async function calculateChecksum(fileName: string) {
	const path = await fixedResourcePath();
	const contents = await readBinaryFile(`${path}\\${fileName}`);
	const hashAsArrayBuffer = await crypto.subtle.digest("SHA-256", contents);

	const uint8ViewOfHash = new Uint8Array(hashAsArrayBuffer);
	const hashAsString = Array.from(uint8ViewOfHash)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return hashAsString;
}
