<?php
if (!isset($_POST['action'])) die('action not provided');
require __DIR__ . '/db.php';

function param($name) {
  if (!isset($_POST[$name])) die("$name not provided");
  return $_POST[$name];
}

try {
  switch ($_POST['action']) {
    case 'insert':
      $conn->prepare('INSERT INTO `playlist` (`videoID`, `playlistID`) VALUES (?, ?)')
        ->execute([param('videoID'), param('playlistID')]);
      $id = $conn->lastInsertId();
      // Restoring a deleted video sends its old data along.
      if (isset($_POST['data'])) {
        $conn->prepare('UPDATE `playlist` SET `data` = ? WHERE `ID` = ?')->execute([$_POST['data'], $id]);
      }
      $sql = $conn->prepare('SELECT `ID`, `videoID`, `data` FROM `playlist` WHERE `ID` = ?');
      $sql->execute([$id]);
      $result = $sql->fetchAll(PDO::FETCH_ASSOC);
      $i = 0;
      echo 's';
      include __DIR__ . '/video.php';
      die();
    case 'update':
      $conn->prepare('UPDATE `playlist` SET `data` = ? WHERE `ID` = ?')
        ->execute([param('data'), param('ID')]);
      break;
    case 'delete':
      $conn->prepare('DELETE FROM `playlist` WHERE `ID` = ?')
        ->execute([param('ID')]);
      break;
    case 'saveSearch':
      $conn->prepare('UPDATE `playlists` SET `searches` = ? WHERE `ID` = ?')
        ->execute([param('data'), param('playlistID')]);
      break;
    default:
      die('unknown action');
  }
} catch (PDOException $e) {
  die('MySQL query failed: ' . $e->getMessage());
}
echo 'success';
