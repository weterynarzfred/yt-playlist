<?php
if (isset($_POST['action'])) {
  require __DIR__ . '/db.php';

  switch ($_POST['action']) {
    case 'insert':
      if (isset($_POST['videoID'])) {
        if (isset($_POST['playlistID'])) {
          $sql = sprintf("INSERT INTO `playlist` (`videoID`, `playlistID`) VALUES ('%s', '%s')", $_POST['videoID'], $_POST['playlistID']);
        } else {
          echo 'playlistID not provided';
        }

      } else {
        echo 'videoID not provided';
      }

      break;
    case 'update':
      if (isset($_POST['data'])) {
        if (isset($_POST['ID'])) {
          $sql = sprintf("UPDATE `playlist` SET `data`='%s' WHERE `ID` = '%d'", str_replace("'", "''", $_POST['data']), $_POST['ID']);
        } else {
          echo 'ID not provided';
        }

      } else {
        echo 'data not provided';
      }

      break;
    case 'delete':
      if (isset($_POST['ID'])) {
        $sql = sprintf("DELETE FROM `playlist` WHERE `ID` = '%d'", $_POST['ID']);
      } else {
        echo 'ID not provided';
      }

      break;
    case 'saveSearch':
      if (isset($_POST['playlistID'])) {
        $sql = sprintf("UPDATE `playlists` SET `searches`='%s' WHERE `ID` = '%d'", str_replace("'", "''", $_POST['data']), $_POST['playlistID']);
      } else {
        echo 'playlistID not provided';
      }

      break;
    default:
      echo 'unknown action';
  }
  try {
    $conn->exec($sql);
  } catch (PDOException $e) {
    echo "MySQL Update failed: " . $e->getMessage();
    die();
  }
  if ($_POST['action'] === 'insert') {
    echo 's';
    $sql = "SELECT `ID`, `videoID`, `data` FROM `playlist` ORDER BY `ID` DESC LIMIT 1";
    try {
      $sql = $conn->prepare($sql);
      $sql->execute();
      $result = $sql->fetchAll(PDO::FETCH_ASSOC);
      if ($result) {
        $i = 0;
        include __DIR__ . '/video.php';
      }
    } catch (PDOException $e) {
      echo "MySQL Selection failed: " . $e->getMessage();
      die();
    }
  } else {
    echo 'success';
  }

  die();
}
echo 'action not provided';
die();
