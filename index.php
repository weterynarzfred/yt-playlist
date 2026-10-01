<?php
  require __DIR__ . '/db.php';
  $asset = fn($file) => "./dist/$file?v=" . filemtime(__DIR__ . "/dist/$file");
?>
<!DOCTYPE html>
<html>

<head>
  <title></title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <link rel="icon" type="image/png" href="./favicon.png" />
  <link rel="stylesheet" href="<?=$asset('style.css')?>" />
</head>

<body>
  <div class="page">
    <?php if (!isset($_GET['playlistID'])) {?>
    <div class="playlists">
      <ul>
        <li><a href="?playlistID=1">1. susek</a></li>
        <li><a href="?playlistID=3">3. agresja: 0</a></li>
        <li><a href="?playlistID=4">4. johnny</a></li>
        <li><a href="?playlistID=5">5. ~polskie</a></li>
        <li><a href="?playlistID=6">6. alenka</a></li>
        <li><a href="?playlistID=9">9. m jane</a></li>
      </ul>
      <p>Już dawno miałem tutaj zrobić listę playlist, ale mi to średnio szło.
        Teraz też nie chciało mi się pisać tego porządnie, więc zamiast tego
        wrzuciłem po prostu linki do tych o których wiem. Jak bardzo chcecie
        żebym coś pozmieniał to piszcie.</p>
      <p>Jak któreś ID jest puste to możecie sobie brać. Nie chce mi się bawić w
        logowanie, hasła i inne bajery.</p>
    </div>
  </div>
    <?php } else {
        $searches = [];
        try {
          $sql = $conn->prepare('SELECT `searches` FROM `playlists` WHERE `ID` = ?');
          $sql->execute([$_GET['playlistID']]);
          $result = $sql->fetchAll(PDO::FETCH_ASSOC);
          if ($result) {
            $searches = json_decode($result[0]['searches']);
          } else {
            $conn->prepare('INSERT INTO `playlists` (`ID`, `searches`) VALUES (?, ?)')
              ->execute([$_GET['playlistID'], json_encode([])]);
          }
        } catch (PDOException $e) {
          echo "MySQL Selection failed: " . $e->getMessage();
          die();
        }
      ?>
    <div class="player-column">
      <div id="player"></div>
      <div id="buttons">
        <div id="randomize">rand</div>
        <div id="sort">sort</div>
        <div id="next">next</div>
      </div>
      <textarea id="filter" placeholder="RegExp search, case insensitive"></textarea>
      <div id="searches-wrap" data-searches='<?=htmlspecialchars(json_encode($searches), ENT_QUOTES)?>'>
        <div id="searches">
          <div id="search-save">save</div>
          <div id="search-list"></div>
        </div>
      </div>
    </div>
    <div id="playlist" data-playlistID="<?=htmlspecialchars($_GET['playlistID'])?>">
      <?php
        try {
          $sql = $conn->prepare('SELECT `ID`, `videoID`, `data` FROM `playlist` WHERE `playlistID` = ?');
          $sql->execute([$_GET['playlistID']]);
          $result = $sql->fetchAll(PDO::FETCH_ASSOC);
          for ($i = 0; $i < count($result); $i++) {
            include __DIR__ . '/video.php';
          }
        } catch (PDOException $e) {
          echo "MySQL Selection failed: " . $e->getMessage();
          die();
        }
      ?>
    </div>
    <form class="add-form">
      <input type="text" placeholder="paste the ID of a youtube video here" class="add-video" />
    </form>
  </div>
  <div id="console">
    <svg viewBox="0 0 10 10">
      <path d="M1 5L4 5M6 5L9 5M5 1L5 4M5 6L5 9" stroke-width="1" stroke="#aaa" />
    </svg>
  </div>
  <script src="<?=$asset('yt.js')?>"></script>
    <?php }?>
</body>

</html>
