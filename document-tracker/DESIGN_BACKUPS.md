# Design Backups

This file tracks saved design versions for easy restoration.

## Available Designs

### phoneshop
- **File**: `src/pages/landing/Landing.phoneshop.backup.tsx`
- **Description**: Bento box layout with phone mockup, catchy hook card, stats, and interactive features
- **Features**:
  - Large phone mockup with switching content carousel
  - "Never Lose Track of What Matters Most" hook
  - Stats card with circular progress chart (50K+ documents)
  - Catchy hook card with animated icon and social proof
  - Mini laptop settings preview
  - Clickable pills/tabs for How It Works
  - Dropdown menu style features section

### technexus
- **File**: `src/pages/landing/Landing.technexus.backup.tsx`
- **Description**: Dark purple design with floating glass cards and gradient text
- **Features**:
  - Deep purple-black background (#0f0a1e) with noise texture
  - Centered hero text with animated gradient "potential" word
  - Two CTA buttons: "Let's Start" (white) and "Play Video" (glass)
  - 4 floating stats cards (7k+ Users, 99.9% Uptime, 24/7 Support, 50+ Features)
  - Timeline layout for How It Works (4 steps)
  - Hover cards grid for Features (6 cards)
  - Dark footer

## How to Restore

To restore a design, simply copy the backup file over the main file:

```bash
# Restore phoneshop design
cp src/pages/landing/Landing.phoneshop.backup.tsx src/pages/landing/Landing.tsx

# Restore technexus design
cp src/pages/landing/Landing.technexus.backup.tsx src/pages/landing/Landing.tsx
```

Or use the command:
```
restore phoneshop design
restore technexus design
```

