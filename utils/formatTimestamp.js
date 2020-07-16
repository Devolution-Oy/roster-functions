exports.formatTimestamp = timestamp => {
  var a = new Date(timestamp);
  var year = a.getFullYear();
  var month = a.getMonth() + 1;
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = year + '-' + String(month).padStart(2, '0') + '-' + String(date).padStart(2, '0')
    + ' ' + String(hour).padStart(2,'0') + ':' + String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  return time;
};