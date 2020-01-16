<?php
    $name = $_POST['firstname'];
    $visitor_email = $_POST['email'];
    $message = $_POST['message'];

    $email_from = 'kaela.gobencion@gmail.com';

	$email_subject = "New Form submission";

	$email_body = "You have received a new message from the user $name.\n".
                            "Here is the message:\n $message".
        
    $to = "yourname@yourwebsite.com";

    $headers = "From: $email_from \r\n";

    mail($to,$email_subject,$email_body,$headers);
?>