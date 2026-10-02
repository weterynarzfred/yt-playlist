<?php
  $data    = json_decode($result[$i]['data']);
  $title   = htmlspecialchars($data->title ?? '');
  $videoID = htmlspecialchars($result[$i]['videoID']);
?>
<div class="video" data-ID="<?=$result[$i]["ID"]?>"
  data-videoID="<?=$videoID?>" data-title="<?=$title?>"
  data-starttime="<?=htmlspecialchars($data->startTime ?? '')?>" data-endtime="<?=htmlspecialchars($data->endTime ?? '')?>">
  <div class="video-menu-button">⋯</div>
  <div class="video-title">
    <?=$title == "" ? "???" : $title?></div>
</div>
