# Confirmation Checkpoints Guide

Detailed guidance for handling user confirmations at critical points in the quick start process.

## Pre-Checkpoint: Research Summary

### Purpose
Before generating content, present research findings to user for validation.

### What to Present

```markdown
## Market Research Summary

I've researched your product area and discovered the following insights:

### User Pain Points Found:
Based on web searches, users in this space commonly struggle with:
1. **{Pain point 1}** - Found via search: "{search query}"
2. **{Pain point 2}** - Found via search: "{search query}"
3. **{Pain point 3}** - Found via search: "{search query}"

### Keywords Users Actually Search:

| Language | High-Value Keywords | Search Intent |
|----------|---------------------|---------------|
| English | {keyword1}, {keyword2} | {what users want} |
| Chinese | {关键词1}, {关键词2} | {用户需求} |
| Japanese | {キーワード1}, {キーワード2} | {ユーザーの意図} |

### Competitor Positioning:
- {Competitor 1}: "{their tagline/positioning}"
- {Competitor 2}: "{their tagline/positioning}"

### Recommended Content Strategy:
Based on research, I recommend:
- **Primary message:** Address {pain point 1}
- **Key differentiator:** {how you're different from competitors}
- **Target keywords:** {list for each language}

---

Does this research align with your understanding of the market?
- Reply **Y** to proceed with content generation based on these findings
- Reply **adjust** to modify the strategy
- Provide corrections if any findings are inaccurate
```

### Handling User Responses

| Response | Action |
|----------|--------|
| "Y", "yes" | Proceed to content generation |
| "adjust" | Ask what should be changed |
| "our target is actually..." | Update understanding and re-confirm |
| "this keyword is wrong" | Research again with corrected info |
| "we should emphasize X instead" | Adjust content strategy |

---

## Checkpoint 1: Content Review

### Purpose
Ensure generated content matches the user's expectations before applying changes.

### What to Present

```markdown
## Generated Content Preview

I've generated the following content based on your product information AND market research:

### 1. SEO & Branding

| Language | Title | Tagline | Description (truncated) |
|----------|-------|---------|------------------------|
| English | {value} | {value} | {first 50 chars}... |
| Chinese | {value} | {value} | {first 50 chars}... |
| Japanese | {value} | {value} | {first 50 chars}... |

### 2. Hero Section (English)
**Headline:** {value}
**Description:** {value}
**CTA:** {value}

### 3. Features (English)
| # | Title | Description |
|---|-------|-------------|
| 1 | {title} | {description} |
| 2 | {title} | {description} |
| ... | ... | ... |

### 4. FAQ (showing 3 of {total})
1. **Q:** {question}
   **A:** {answer}
2. ...

---

**Options:**
- Reply **Y** or **yes** to proceed with these changes
- Reply **edit [section]** to modify a specific section (e.g., "edit hero")
- Reply **regenerate** to regenerate all content
- Provide specific feedback for targeted changes
```

### Handling User Responses

| Response | Action |
|----------|--------|
| "Y", "yes", "proceed" | Continue to Checkpoint 2 |
| "edit hero" | Ask for specific hero changes |
| "edit feature 2" | Ask what to change in feature 2 |
| "regenerate" | Re-collect information or regenerate all |
| "the tagline should be..." | Apply specific change and re-confirm |
| "looks good but change X" | Apply change and proceed |

## Checkpoint 2: Navigation Changes

### Purpose
Header and Footer changes significantly impact site structure. Require explicit confirmation.

### Step 2.1: Header Analysis

First, read current Header and present analysis:

```markdown
## Header Navigation Analysis

Current header links in your template:

| # | Name | URL | Recommendation |
|---|------|-----|----------------|
| 1 | Features | /#features | ✅ KEEP - Standard SaaS navigation |
| 2 | Pricing | /#pricing | ✅ KEEP - Essential for conversions |
| 3 | AI Demo | /ai-demo | ⚠️ REVIEW - Only keep if your product has AI |
| 4 | Blog | /blog | ✅ KEEP - Good for SEO and content marketing |
| 5 | Demo (dropdown) | # | ⚠️ REVIEW - Contains NEXTY-specific demos |

### Questions:

1. **AI Demo link:** Does your product have AI capabilities?
   - If yes → Keep or rename
   - If no → Remove
   
2. **Demo dropdown:** This contains links to NEXTY demos.
   - Remove entirely?
   - Replace with your own demos/products?
   - Keep as-is?

3. **Add new links?**
   - Documentation (/docs)?
   - Contact (/contact)?
   - Other pages?
```

### Step 2.2: Footer Analysis

```markdown
## Footer Navigation Analysis

Current footer structure:

### Group 1: Products
- Features (/#features)
- Pricing (/#pricing)
- Blog (/blog)
- Glossary (/glossary)

### Group 2: Support
- Docs (https://docs.nexty.dev/docs) ⚠️ Points to NEXTY docs
- Roadmap (https://nexty.dev/roadmap) ⚠️ Points to NEXTY site

### Group 3: Languages
- English, 中文, 日本語 (auto-handled, no changes needed)

### Questions:

1. **Products group:** 
   - Keep Glossary link?
   - Add other pages?

2. **Support group:**
   - Update Docs link to your documentation?
   - Update/remove Roadmap link?
   - Add Contact page?
```

### Step 2.3: Social Media Links

```markdown
## Social Media Configuration

Current social links in `config/site.ts`:

| Platform | Current Value | Your Link |
|----------|---------------|-----------|
| GitHub | (empty) | |
| Twitter/X | (empty) | |
| YouTube | (empty) | |
| Discord | (from env) | |
| Email | (empty) | |

Please provide any social links you'd like to add:
- Leave blank to skip
- Provide "remove" to explicitly clear
```

### Step 2.4: Final Navigation Confirmation

```markdown
## Final Navigation Structure

### Header (after changes):
```json
[
  { "name": "Features", "href": "/#features" },
  { "name": "Pricing", "href": "/#pricing" },
  { "name": "Blog", "href": "/blog" }
]
```

### Footer Groups (after changes):
```json
[
  {
    "title": "Products",
    "links": [
      { "href": "/#features", "name": "Features" },
      { "href": "/#pricing", "name": "Pricing" },
      { "href": "/blog", "name": "Blog" }
    ]
  },
  {
    "title": "Support", 
    "links": [
      { "name": "Documentation", "href": "/docs" },
      { "name": "Contact", "href": "mailto:hello@example.com" }
    ]
  }
]
```

### Social Links:
- GitHub: https://github.com/yourname
- Twitter: https://twitter.com/yourhandle
- Discord: (kept from environment)

---

**Confirm these navigation changes?**
- Reply **Y** to apply all changes
- Reply **adjust [section]** to make adjustments
- Reply **skip navigation** to keep original navigation
```

## Handling Complex Scenarios

### Scenario: User wants partial changes

```markdown
User: "Keep the header as is, but update the footer docs link"

Response: 
I'll make these changes:
- ✅ Header: No changes
- ✅ Footer: Update Docs link from `https://docs.nexty.dev/docs` to your docs URL

What URL should the Docs link point to?
```

### Scenario: User is unsure about changes

```markdown
User: "I'm not sure what to do with the Demo dropdown"

Response:
Here are your options for the Demo dropdown:

1. **Remove entirely** - If you don't have demos to show
2. **Keep and customize** - Replace NEXTY demos with your own:
   - Your demo site URLs
   - Your product screenshots/videos
3. **Keep as-is** - Leave NEXTY demos (not recommended for production)
4. **Convert to single link** - Change from dropdown to single "Demo" link

Which option works best for your product?
```

### Scenario: User provides incomplete information

```markdown
User: "Just use my GitHub"

Response:
I'll add your GitHub link. Could you provide:
- Your GitHub URL (e.g., https://github.com/username or https://github.com/username/repo)

The other social links will remain empty unless you'd like to add them:
- Twitter/X
- Discord
- YouTube
```

### Scenario: User wants to add custom links

```markdown
User: "I want to add a Changelog page to the header"

Response:
I'll add a Changelog link to the header. Please confirm:
- **Name:** "Changelog" (or different name?)
- **URL:** "/changelog" (or different path?)
- **Position:** After Blog (or different position?)

Updated header will be:
1. Features → /#features
2. Pricing → /#pricing
3. Blog → /blog
4. Changelog → /changelog

Confirm? (Y/N)
```

## Error Recovery

### Invalid JSON after changes

If file updates result in invalid JSON:

1. Show the error to user
2. Offer to:
   - Retry the update
   - Show the problematic content for manual review
   - Restore from git (if changes were committed)

### Missing translations

If translations cannot be generated:

1. Generate English content first
2. Flag incomplete translations
3. Offer to:
   - Use English as placeholder
   - Skip that language
   - Let user provide translation

## Summary Checklist for Checkpoints

### Checkpoint 1 (Content Review):
- [ ] Present SEO content in table format
- [ ] Show Hero section content
- [ ] List all features with titles/descriptions
- [ ] Show sample FAQs
- [ ] Wait for explicit confirmation before proceeding

### Checkpoint 2 (Navigation):
- [ ] Analyze current Header links with recommendations
- [ ] Analyze current Footer links with recommendations
- [ ] Collect social media links
- [ ] Present final structure before applying
- [ ] Wait for explicit confirmation
- [ ] Handle partial change requests

### Final Verification:
- [ ] All JSON files are valid (use JSON.parse check mentally)
- [ ] All three languages are updated
- [ ] config/site.ts is updated
- [ ] Inform user that changes are complete
- [ ] Suggest next steps (run dev server, verify changes)
