app.post("/downloadCertsZip", function (req, res) {

  var hostPath = __dirname +'/certificate/'+req.body.dp_hostname;
  var interPath = __dirname +'/certificate/'+req.body.dp_hostname+'/intermediate/';

  if (fs.existsSync(hostPath) && fs.existsSync(interPath)){
    fs.readdir(interPath,function(err, interfiles){
      if (err) {
        //this is not how you should handle errors, you need to give a response to the user.....
        return console.error(err);
      }

      var fl = interfiles.length;
      console.log("length",fl);

      if(fl >0){
        var certPath = __dirname +'/certificate/'+req.body.dp_hostname+'/certificate/';
        res.type('application/zip');
        res.attachment('file.zip');
        var archive = archiver('zip');
        archive.pipe(res);

        fs.readdir(certPath,function(err, files){
          if (err) {
            //this is not how you should handle errors...
            return console.error(err);
          }

          archive.append(fs.createReadStream(certPath+files[0]),{name:files[0]})

          interfiles.forEach(function(interfile){
            if(interfile){
              archive.append(fs.createReadStream(interPath+interfile),{name:interfile})
            }
          });

          archive.finalize();
        });
      }

      // nothing here again?
    });
  }
  //nothing happens when files does not exist? You need to close the request...
});
