-- Fix the validate_content_length function to handle different table schemas
CREATE OR REPLACE FUNCTION validate_content_length()
RETURNS TRIGGER AS $$
BEGIN
  -- For chat_messages table, check the message column
  IF TG_TABLE_NAME = 'chat_messages' THEN
    IF LENGTH(NEW.message) > 2000 THEN
      RAISE EXCEPTION 'Message content exceeds maximum length of 2000 characters';
    END IF;
  END IF;
  
  -- For forum_posts table, check the content column
  IF TG_TABLE_NAME = 'forum_posts' THEN
    IF LENGTH(NEW.content) > 10000 THEN
      RAISE EXCEPTION 'Post content exceeds maximum length of 10000 characters';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;