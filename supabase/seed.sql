-- ==============================================================================
-- College Lost & Found Portal - Seed Data
-- supabase/seed.sql
-- ==============================================================================

-- Reset sequence to start with 100
select setval('item_ref_seq', 100);

-- Insert realistic items
insert into public.items (
  ref_code,
  type,
  title,
  description,
  category,
  location,
  occurred_at,
  status,
  photo_path,
  private_detail,
  held_at
) values
(
  'LF-2041',
  'found',
  'Casio fx-991EX scientific calculator',
  'Found on study carrel in library second floor stacks. Has white slide cover with engineering formula sticker.',
  'electronics',
  'Main Library & Research Commons',
  '2026-11-21 09:15:00+00',
  'open',
  null,
  'Student initials J.V. etched in lower right corner of slide cover.',
  'Central Library Vault, Room 104'
),
(
  'LF-2040',
  'found',
  'Apple 14-inch MacBook Pro (Space Grey)',
  'Space Grey aluminium chassis. Discovered on laboratory bench 3 after afternoon optics workshop.',
  'electronics',
  'Science Quad & Laboratories',
  '2026-11-21 08:30:00+00',
  'verified',
  null,
  'Circular PNW mountain sticker near left hinge. Faint scratch across Apple logo.',
  'Vault Cabinet B, Shelf 3'
),
(
  'LF-2038',
  'lost',
  'Hostel room keys on red SJU lanyard',
  'Set of two brass Yale keys with university dormitory tag. Red woven strap with white university lettering.',
  'keys',
  'Student Union & Dining Hall',
  '2026-11-20 16:30:00+00',
  'open',
  null,
  'Room 314 tag with red marker dot on reverse side; small silver bottle opener attached.',
  'Key Drawer 2, Slot 18'
),
(
  'LF-2035',
  'found',
  'Sony WH-1000XM4 wireless headphones',
  'Matte black over-ear headphones in black zip hard case with audio cable inside.',
  'electronics',
  'Science Quad Lab 201',
  '2026-11-20 14:30:00+00',
  'open',
  null,
  'Paracord zipper pull tied to case zipper. Airplane two-prong adapter in mesh pouch.',
  'Vault Cabinet A, Shelf 1'
),
(
  'LF-2030',
  'found',
  'TI-84 Plus CE graphing calculator',
  'Black casing with colour screen. Charging cable wrapped around unit with blue rubber band.',
  'electronics',
  'Founders Engineering Hall',
  '2026-11-19 15:00:00+00',
  'verified',
  null,
  'Surname S. Jenkins engraved with electric pencil on inside of slide cover.',
  'Central Desk Pickup Shelf 4'
),
(
  'LF-1983',
  'found',
  'Navy blue Herschel backpack with broken zip',
  'Navy canvas bookbag with front pouch zipper slider detached. Contains course binders and notebook.',
  'bags-backpacks',
  'Founders Engineering Hall',
  '2026-11-04 10:10:00+00',
  'returned',
  null,
  'Robotics club membership patch inside main compartment. Mechanical pencil set in mesh organizer.',
  'Released from vault custody'
);
