(function(context, window) {
    // get image meta data
    function getImageMetaData(fileOrBlob, callback) {
        loadImage.parseMetaData(
            fileOrBlob,
            function(data) {
                callback(data);
            }, {
                maxMetaDataSize: 262144,
                disableImageHead: false
            }
        )
    }

    // resize image
    function resizeImageWithoutToBlob(fileObj, maxSize, callback) {
        var fileOrBlob = null;
        if(fileObj.files){
            fileOrBlob = fileObj.files[0];
        } else {
            fileOrBlob = fileObj;
        }
        // parser EXIF data
        getImageMetaData(fileOrBlob, function(data) {
            var orientation = 0; //0 indidate not orientation info
            if(data && data.exif){
                orientation = data.exif.get('Orientation');
            }
            // load image and scale
            loadImage(
                fileOrBlob,
                function(img) {
                    callback(img);
                }, {
                    maxWidth: maxSize,
                    maxHeight: maxSize,
                    orientation: orientation,
                    canvas: true
                }
            );
        })
    }

    function resizeImage(fileObj, maxSize, callback) {
        resizeImageWithoutToBlob(fileObj, maxSize, function(img){
            // read blob
            img.toBlob(function(blob){
                callback(blob, img);
            },'image/jpeg', 0.8);
        })
    }
    context.resizeImage = resizeImage;
    context.resizeImageWithoutToBlob = resizeImageWithoutToBlob;

    // export for node module
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
        module.exports.resizeImage = resizeImage;
        module.exports.resizeImageWithoutToBlob = resizeImageWithoutToBlob;
    }

})(typeof self !== 'undefined' ? self : this);
