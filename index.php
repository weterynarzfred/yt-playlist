<?php require __DIR__ . '/db.php'; ?>

<!DOCTYPE html>
<html>

<head>
  <title></title>
  <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
  <meta name="viewport" content="width=device-width" />
  <link rel="icon" type="image/png" href="./favicon.png" />
  <link rel="stylesheet" type="text/css" href="./style.css?ver=1.3.3" />
</head>

<body>
  <div class="r"></div>
  <div class="part slim">
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
    <?php } else {
        $searches = false;
        try {
          $sql = $conn->prepare('SELECT `searches` FROM `playlists` WHERE `ID` = ?');
          $sql->execute([$_GET['playlistID']]);
          $result = $sql->fetchAll(PDO::FETCH_ASSOC);
          if ($result && count($result)) {
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
    <div id="nav">
      <div id="delete-toggle">toggle delete</div>
    </div>
    <div class="flex">
      <div class="player-flex">
        <div id="player"></div>
        <div class="rmin"></div>
        <div id="buttons">
          <div id="randomize">rand</div>
          <div id="sort">sort</div>
          <div id="next">next</div>
        </div>
        <div class="rmin"></div>
        <textarea id="filter"
          placeholder="RegExp search, case insensitive"></textarea>
        <?php
          if ($searches !== false) {
            ?>
        <div id="searches-wrap">
          <div id="searches"
            data-searches='<?=htmlspecialchars(json_encode($searches), ENT_QUOTES)?>'>
            <div id="search-save">save</div>
            <div id="search-list">
              <?php
                for ($i = 0; $i < count($searches); $i++) {
                    ?>
              <div class="search" data-search-id="<?=$i?>">
                <div class="search-delete"></div>
                <div class="search-title"
                  data-filter="<?=htmlspecialchars($searches[$i])?>">
                  <?=htmlspecialchars($searches[$i])?></div>
              </div>
              <?php
                }
                  ?>
            </div>
          </div>
        </div>
        <?php
          }
          ?>
        <div id="lyrics"></div>
        <div class="rmin"></div>
      </div>
      <div id="playlist" data-playlistID="<?=htmlspecialchars($_GET['playlistID'])?>">
        <?php
            try {
              $sql = $conn->prepare('SELECT `ID`, `videoID`, `data` FROM `playlist` WHERE `playlistID` = ?');
              $sql->execute([$_GET['playlistID']]);
              $result = $sql->fetchAll(PDO::FETCH_ASSOC);
              if ($result) {
                for ($i = 0; $i < count($result); $i++) {
                  include __DIR__ . '/video.php';
                }
              }
            } catch (PDOException $e) {
              echo "MySQL Selection failed: " . $e->getMessage();
              die();
            }
          ?>

      </div>
      <div id="lyric-editor"></div>
    </div>
    <form class="add-form">
      <input type="text" placeholder="paste the ID of a youtube video here"
        class="add-video" />
    </form>
    <?php }?>
  </div>
  <div class="r"></div>
  <div class="r"></div>
  <div id="console">
    <svg id="load-icon" viewBox="0 0 10 10" style="display:none;">
      <path d="M1 5L4 5" stroke-width="1" stroke="#aaa" />
      <path d="M6 5L9 5" stroke-width="1" stroke="#aaa" />
      <path d="M5 1L5 4" stroke-width="1" stroke="#aaa" />
      <path d="M5 6L5 9" stroke-width="1" stroke="#aaa" />
    </svg>
  </div>
  <script
    src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js">
  </script>
  <script src="./yt.js?ver=1.3.3"></script>
</body>

</html>
