ffmpeg -f lavfi -i color=c=black:s=640x480:d=1 -c:v libx264 -y test_v.mp4
echo -e "1\n00:00:00,000 --> 00:00:01,000\nTest\n" > /tmp/d5a6a5f3bf32fdf13f83e4dd3ac6574c.srt
ffmpeg -nostdin -loglevel error -i test_v.mp4 -filter_complex "[0:v]subtitles='/tmp/d5a6a5f3bf32fdf13f83e4dd3ac6574c.srt'[vout]" -map "[vout]" -y test_out.mp4 2> err.log
cat err.log
