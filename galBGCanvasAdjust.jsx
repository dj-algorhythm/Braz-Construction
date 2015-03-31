app.preferences.rulerUnits = Units.PIXELS;
var dir = "//vboxsvr/BrazConstruction/galBGBorderAdjust_test/",
    folderObj = Folder(dir),
    files = folderObj.getFiles("*");

var fileRef, docRef, exportOptions, saveObj;

var newWidth = function(){
	var docWidth = docRef.width.as("px");
	docWidth = docWidth - 5;
	var newDocWidth = new UnitValue(docWidth, "px");
	return newDocWidth;
}

for (var i = 0; i < files.length; ++i){
	fileRef = File(files[i].absoluteURI);

    docRef = app.open(fileRef);

    docRef.resizeCanvas(newWidth(),docRef.height);

    fileRef.close(SaveOptions.SAVECHANGES);

    fileRef = null;
    docRef = null;

    // exportOptions = new ExportOptionsSaveForWeb();
    // exportOptions.format = SaveDocumentType.PNG;
    // exportOptions.PNG8 = true;
    // exportOptions.transparency = true;

    // saveObj = new File(fileRef.absoluteURI);

    // fileRef.saveAs(saveObj,exportOptions,false,Extension.LOWERCASE);
}