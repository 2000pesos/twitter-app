<?php
require "autoload.php";

use Abraham\TwitterOAuth\TwitterOAuth;

$access_token = "551502944-Qj5a60Kwp2WL9qxUYXQd0RuvRfTIjKTLPTxJV10I";
$access_token_secret = "ywdWM6HI7aYO0W7a9VgPSRrnqCd2mD9dBIl2Foz6Xj1Ys";
$consumer_key = "myyr03ZNGKH4miPGQDNSAvCiT";
$consumer_secret = "fr948RDYjZjUo2qLFlBGEnER3jQ0UtsxUmlI5eEq0APZ0b0sIY";

$connection = new TwitterOAuth($consumer_key, $consumer_secret, $access_token, $access_token_secret);
switch($_GET['searchType']){
	case "tweets":
		$searchType = 'search/tweets';
		$searchTerm = $_GET['searchTerm'];
		$searchParams = array("q" => $searchTerm, "count" => "20");
		if(isset($_GET['maxId'])){
			$searchParams["max_id"] = $_GET['maxId'];
		}
		$content = $connection->get($searchType, $searchParams);
	break;
	case "hashtag":
		$searchType = 'search/tweets';
		$searchTerm = "#".$_GET['searchTerm'];
		$searchParams = array("q" => $searchTerm, "count" => "20");
		if(isset($_GET['maxId'])){
			$searchParams["max_id"] = $_GET['maxId'];
		}
		$content = $connection->get($searchType, $searchParams);
	break;
	case "user": 
		$searchType = 'statuses/user_timeline';
		$searchTerm = str_replace("@", "", $_GET['searchTerm']);
		$searchParams = array("screen_name" => $searchTerm, "count" => "20");
		if(isset($_GET['maxId'])){
			$searchParams["max_id"] = $_GET['maxId'];
		}
		$content = $connection->get($searchType, $searchParams);
	break;
}
echo json_encode($content);
?>