<?php
require __DIR__ . '/../src/functions.php';
ensure_schema();
$projects = get_projects(false);
if (empty($projects)) { echo "No projects\n"; exit(1); }
$first = $projects[0];
$id = (int)$first['id'];

// English translation of the provided Chinese markdown (concise)
$english_description = <<<'MD'
TL;DR

Tuchsure is an AI-powered visual assistive glove for people who are blind or have low vision. A palm-mounted camera captures the scene, lightweight on-device models perform object and text recognition, and results are delivered via spoken prompts and fingertip haptic feedback—keeping users' hands free, minimizing disturbance, and prioritizing privacy.

Project Overview

Year: 2024
Role: Product Design / Prototype Development / Interaction Design / Embedded Implementation
Type: Assistive Tech (HCI)
Keywords: AI, Computer Vision, On-device, Haptics

Background / Problem

Existing smartphone-based visual aids are often limited by single-hand usage, awkward phone-holding postures, crowded feedback channels (solely voice), and concerns around privacy and robustness. A glove form factor naturally aligns the camera with the user's pointing hand and can offload information to haptic channels to reduce auditory load.

Goals

- Provide near-real-time object recognition and text reading in everyday scenarios.
- Convey directionality and importance via fingertip haptics to reduce reliance on voice.
- Prioritize on-device/edge processing to minimize uploads and protect privacy.

My Role

- System design: camera placement (palm), processing pipeline, haptic mapping strategy.
- Interaction: input (buttons/gestures/optional voice) and output (voice + haptics).
- Prototyping: hardware assembly, firmware/scripts, model compression and deployment.
- Usability testing: task scripts, observational notes, iterative improvements.

Solution Overview

Hardware Prototype

- Small palm camera; back-of-hand controller and power; fingertip linear vibration motors.
- Physical buttons to trigger recognition/readout and switch modes.

Processing Pipeline (simplified)

Capture: image acquisition → basic denoise/exposure compensation
Perception: lightweight detection + OCR models
Fusion: intention-aware aggregation (find handle/read label/scene detection)
Feedback:
- Voice: short, concise spoken summaries (e.g., "Milk, expiry 10/23")
- Haptic: map direction/distance to fingers and vibration intensity/pattern

Haptic mapping (concept)

Thumb / Index / Middle / Ring / Little finger → approximate 5-sector visual field
Closer targets → faster/higher-intensity vibration; urgent obstacles → double-tap pattern

Process (summary)

1) Research: desk research, product comparison, early usability observations
2) Ideation: three interaction modes (tap-to-recognize / continuous scan / guidance)
3) Prototype & Test: repeated adjustment of camera angle and motor placement; indoor/outdoor task trials
4) Implementation notes: lightweight models, preprocessing, event bus for multi-channel output

Results & Impact

- Reliable object/text feedback across everyday scenarios
- Haptic guidance reduced auditory load, improving usability in noisy or quiet environments
- Demonstrated potential for wearable, private visual assistance

Next Steps

- Integrate edge accelerators (NPU/TPU) and improve low-light robustness
- Add object-following feedback and multi-language OCR/TTS
- Gesture triggers and scene-adaptive strategies

Media

- Images: palm camera and wiring (Tuchsure-1)
- Diagrams: fingertip motor layout (Tuchsure-2)
- Optional: 10s demo/GIF for recognition→feedback loop

Accessibility & Ethics

- Default offline; avoid face recognition or identity inference
- Limit spoken content to non-sensitive summaries; clear local cache
- Safety notes for skin contact and long-term wear

Acknowledgements

Thanks to participants, volunteers, and hardware/support providers.

MD;

// Update fields per your provided values
$update = $first;
$update['title'] = 'Tuchsure — AI Visual Assistive Glove';
$update['slug'] = 'tuchsure';
$update['year'] = 2024;
$update['tags'] = 'AI,Assistive,HCI,Embedded';
$update['image_url'] = '/uploads/1.5.JPG';
$update['gallery'] = ['/uploads/tuchsure-1.jpg', '/uploads/tuchsure-2.jpg'];
$update['url'] = '';
$update['featured'] = 1;
$update['order_index'] = 700;
$update['description'] = $english_description;

update_project($id, $update);
echo "Populated project id={$id}, title={$update['title']}\n";
?>