// One place to customise the site. Edit these before you publish.
export const SITE = {
  name: "Fox Blogs",
  tagline: "Where Stories Come to Life",
  description:
    "Articles for curious minds on technology, lifestyle, fitness, travel and productivity.",
  author: {
    name: "Fox Goody",
    role: "Writer & Developer",
    bio: "Curious about code, craft and everything in between. I write about what I learn so you can skip the dead ends.",
  },
  email: "naveen85966@gmail.com",
  social: {
    github: "https://github.com/official-naveen",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
    instagram: "https://instagram.com",
  },
};

// Categories an admin can pick when writing a post.
export const CATEGORIES = [
  { name: "Technology", icon: "fa-microchip", blurb: "AI, software, gadgets and the future of tech." },
  { name: "Lifestyle", icon: "fa-leaf", blurb: "Mindset, habits and living well." },
  { name: "Fitness", icon: "fa-dumbbell", blurb: "Training, nutrition and staying active." },
  { name: "Travel", icon: "fa-compass", blurb: "Places, journeys and field notes." },
  { name: "Productivity", icon: "fa-bolt", blurb: "Do deeper work in less time." },
  { name: "Other", icon: "fa-feather", blurb: "Everything that doesn't fit a box." },
];
export const categoryMeta = (name) =>
  CATEGORIES.find((c) => c.name === name) || CATEGORIES[CATEGORIES.length - 1];
