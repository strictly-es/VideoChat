//動画流す準備
var video = document.getElementById("video");
// getUserMedia によるカメラ映像の取得
var media = navigator.mediaDevices.getUserMedia({
  video: true, //ビデオを取得する
  //使うカメラをインカメラか背面カメラかを指定する場合には
  video: { facingMode: "environment" }, //背面カメラ
  video: { facingMode: "user" }, //インカメラ
  audio: true //音声が必要な場合はture
});
//リアルタイムに再生（ストリーミング）させるためにビデオタグに流し込む
media.then(stream => {
  video.srcObject = stream;
});
