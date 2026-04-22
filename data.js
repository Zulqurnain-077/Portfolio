const PORTFOLIO_DATA = {
  chatbot: {
    skills:
      "> CORE: Problem Solving, System Analysis, Software Engineering.<br>> STACK: C++, Python, MongoDB, Web Technologies.<br>> SPECIALTIES: Artificial Intelligence, Computer Vision, Cross-functional Collaboration.",
    education:
      "> BS Computer Science (2022-2026) | Minhaj University Lahore.<br>> FSc Pre-Medical (2019-2021) | Govt. Graduate College for Boys, Model Town.<br>> Matric (2017-2019) | Ch Rehmat Ali Memorial Trust.",
    projects:
      "> 1. AI WORKOUT TRAINER: Built CV system with OpenPose. Replaced VGG-19 with MobileNet to boost FPS. Improved accuracy to 95%.<br>> 2. CROP DETECTION: Engineered a hybrid CNN using EfficientNetV2L.<br>> 3. HOTEL MANAGEMENT: Console-based C++ OOP system.<br>> 4. INTERACTIVE PORTFOLIO: Engineered a high-performance SPA featuring a custom dynamic terminal chatbot, CI/CD pipeline, and anti-bot security.",
    business:
      "> No commercial business inquiries logged. Type 'experience' to view my corporate audit background.",
    experience:
      "> Senior Auditor at Check-In Auditors (June 2024 - Present).<br>> I conduct financial audits, identify data entry discrepancies, and engineer process improvements.",
    achievements:
      "> Designed and deployed dual-impact solutions: a robust Hotel Administration system and the AI fitness trainer, streamlining complex operations.",
    whoami:
      "> Muhammad Zulqurnain. Computer Science Senior and Auditor.<br>> Ambitious developer equipped with comprehensive knowledge in programming and AI.",
    contact:
      "> Scroll to the footer and use the form. Valid @gmail.com addresses only.",
  },
  modals: {
    workouttrainer: {
      title: "AI Personal Workout Trainer",
      tags: ["Computer Vision", "OpenPose", "MobileNet"],
      desc: "Created an AI-based personal workout trainer for detecting and correcting exercise postures in real-time.",
      features: [
        "Developed a computer vision system using OpenPose for exercise posture detection.",
        "Replaced VGG-19 with MobileNet to increase frame processing rate from 5 FPS to 12 FPS.",
        "Implemented a low-latency algorithm for instant feedback on exercise errors.",
        "Achieved an F1 Score of 0.662 and improved user exercise form accuracy from 70% to 95%.",
      ],
    },
    cropdetection: {
      title: "Crop Detection System",
      tags: ["Python", "CNN / EfficientNetV2L", "Image Processing"],
      desc: "A project focused on precision agriculture applications for automated, real-time crop classification.",
      features: [
        "Engineered a high-performance hybrid CNN model using EfficientNetV2L with custom attention mechanisms.",
        "Developed an advanced image preprocessing pipeline to improve texture and contrast features.",
        "Implemented GLCM and color histogram-based feature extraction for robust crop differentiation.",
        "Integrated real-time inference capabilities for automated crop monitoring systems.",
      ],
    },
    hotelmanagement: {
      title: "Hotel Management System",
      tags: ["C++", "OOP", "File Handling"],
      desc: "Developed a console-based hotel management system that streamlines the operational aspects of hotel administration.",
      features: [
        "Implemented complex features including room booking, customer management, and billing.",
        "Utilized core OOP concepts such as classes, inheritance, and polymorphism.",
        "Enhanced file handling techniques for secure data storage and rapid retrieval.",
      ],
    },
    portfoliobot: {
      title: "Interactive Portfolio & CLI Bot",
      tags: ["HTML5 / CSS3", "Vanilla JS", "CI/CD / Vercel"],
      desc: "Engineered a high-performance, responsive single-page application featuring a custom terminal chatbot and an automated cloud deployment pipeline.",
      features: [
        "Developed a fully responsive SPA from scratch using pure HTML, CSS, and Vanilla JavaScript, ensuring zero-latency load times without bloated frameworks.",
        "Built a custom CLI simulation that dynamically parses a headless data configuration file to deliver context-aware responses.",
        "Architected a CI/CD pipeline integrating VS Code, GitHub, and Vercel for automated, zero-downtime live production updates.",
        "Implemented 3D tilt-responsive UI elements, dynamic DOM manipulation, and a secure contact system with strict Regex and invisible honeypot anti-bot mechanisms.",
      ],
    },
  },
};
