/*
  # Initial Schema for Pitch Deck Generator

  1. New Tables
    - `pitch_decks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `slides`
      - `id` (uuid, primary key)
      - `pitch_deck_id` (uuid, foreign key to pitch_decks)
      - `title` (text)
      - `content` (jsonb)
      - `position` (integer)
      - `slide_type` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create pitch_decks table
CREATE TABLE IF NOT EXISTS pitch_decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create slides table
CREATE TABLE IF NOT EXISTS slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_deck_id uuid NOT NULL REFERENCES pitch_decks(id) ON DELETE CASCADE,
  title text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  position integer NOT NULL,
  slide_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for faster slide queries
CREATE INDEX IF NOT EXISTS slides_pitch_deck_id_idx ON slides(pitch_deck_id);
CREATE INDEX IF NOT EXISTS slides_position_idx ON slides(position);
CREATE INDEX IF NOT EXISTS pitch_decks_user_id_idx ON pitch_decks(user_id);

-- Security: Enable Row Level Security
ALTER TABLE pitch_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;

-- Pitch Decks Policies
CREATE POLICY "Users can create their own pitch decks"
  ON pitch_decks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own pitch decks"
  ON pitch_decks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own pitch decks"
  ON pitch_decks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pitch decks"
  ON pitch_decks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Slides Policies
CREATE POLICY "Users can create slides for their own decks"
  ON slides
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM pitch_decks WHERE id = pitch_deck_id
    )
  );

CREATE POLICY "Users can view slides for their own decks"
  ON slides
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM pitch_decks WHERE id = pitch_deck_id
    )
  );

CREATE POLICY "Users can update slides for their own decks"
  ON slides
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM pitch_decks WHERE id = pitch_deck_id
    )
  );

CREATE POLICY "Users can delete slides for their own decks"
  ON slides
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM pitch_decks WHERE id = pitch_deck_id
    )
  );