const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');

const job = schedule.scheduleJob('* * 23 * * *', function () {
  // fs.readdir：读取 uploads 目录中的所有文件。
  // fs.unlink：删除每个文件。
  const directory = path.join(path.dirname(__dirname), 'uploads');
  fs.readdir(directory, (err, files) => {
    try {
      files.forEach(file => {
        const filePath = path.join(directory, file);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Failed to delete file ${filePath}: ${err.message}`);
          } else {
            console.log(`Successfully deleted file: ${filePath}`);
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  })
});

module.exports = job;