import {expect} from "chai";

describe('File uploading', () => {
    it('Upload a single file to cloudinary', () => {
        let results: any;
        expect(results.data.singleFileUpload).not.equal(undefined)
    });
    it('Delete a single file on cloudinary', () => {
        let results: any;
        expect(results.data.singleFileDelete).not.equal(undefined)
    });

    it('Upload multiple files on cloudinary', () => {
        let results: any;
        expect(results.data.multiFileUpload).not.equal(undefined)
    });

    it('Delete multiple files on cloudinary', () => {
        let results: any;
        expect(results.data.multiFileDelete).not.equal(undefined)
    });
});