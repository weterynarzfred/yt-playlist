<?php
  $data = json_decode($result[$i]['data']);
?>
<div class="video" data-ID="<?=$result[$i]["ID"]?>"
  data-videoID="<?=$result[$i]["videoID"]?>" data-title="<?=$data->title?>"
  data-starttime="<?=$data->startTime?>" data-endtime="<?=$data->endTime?>">
  <div class="video-edit">e</div>
  <div class="video-play-next">n</div>
  <div class="video-delete">d</div>
  <div class="video-title">
    <?=$data->title == "" ? "???" : $data->title?></div>
  <div class="video-id"><?=$result[$i]["videoID"]?></div>
  <!-- <div class="video-data"><?=$result[$i]["data"]?></div> -->
</div>
