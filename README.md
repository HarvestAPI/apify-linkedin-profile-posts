## LinkedIn Profile Posts scraper

Our powerful tool helps you gather posts from LinkedIn profiles or companies without compromising security or violating platform policies.

### Key Benefits

- No cookies or account required: Access profile data without sharing cookies or risking account restrictions
- Low pricing: $2 per 1k posts.
- Fast response times deliver data in seconds 🚀
- No caching, fresh data.
- Concurrency: each actor works scraping 3 profiles/companies at a time.

## How It Works

Simply provide one of the following:

- List of LinkedIn profile/company URLs
- List of LinkedIn public identifiers (e.g., `williamhgates` from `https://www.linkedin.com/in/williamhgates`)
- List if LinkedIn profile/company IDs (e.g. ACoAAA8BYqEBCGLg_vT_ca6mMEqkpp9nVffJ3hc)

Optionally:

- `scrapePages` - Number of pages to scrape. Each page is 20 posts. Posts sorted by date.
- `page` - Page number to start scraping from. Default is 1.

### Data You'll Receive

- Post content
- Author information
- Social engagement metrics
- Media: images, videos, and links
- Content of Re-posts

Up to 1000 posts per one actor run.

### Sample output data

Here is the example post output of this actor:

```json
{
  "id": "7319399301971943425",
  "content": "I’m inspired by Safia Ibrahim, a polio survivor who embodies resilience and determination. Her story is a testament to overcoming life’s toughest challenges—and a reminder of why we must continue to fight for a polio-free world. #EndPolio",
  "title": null,
  "subtitle": null,
  "link": null,
  "linkLabel": null,
  "description": null,
  "authorUniversalName": null,
  "authorPublicIdentifier": "williamhgates",
  "authorType": "profile",
  "authorName": "Bill Gates",
  "authorLinkedinUrl": "https://www.linkedin.com/in/williamhgates?miniProfileUrn=urn%3Ali%3Afsd_profile%3AACoAAA8BYqEBCGLg_vT_ca6mMEqkpp9nVffJ3hc",
  "authorInfo": "Chair, Gates Foundation and Founder, Breakthrough Energy",
  "authorWebsite": "https://www.linkedin.com/newsletters/gates-notes-6651495472181637121/",
  "authorWebsiteLabel": "View my newsletter",
  "authorAvatar": {
    "url": "https://media.licdn.com/dms/image/v2/D5603AQF-RYZP55jmXA/profile-displayphoto-shrink_800_800/B56ZRi8g.aGsAc-/0/1736826818808?e=1750896000&v=beta&t=-ok3THccfWUuj-xmZR1y6HPFCE7Q8RLna7KxpU3bOlo",
    "width": 800,
    "height": 800,
    "expiresAt": 1750896000000
  },
  "postedAgo": "5d",
  "postImage": null,
  "postImages": [],
  "postVideo": null,
  "repostId": "7314358712113025024",
  "newsletterUrl": null,
  "newsletterTitle": null,
  "socialContent": {
    "hideCommentsCount": false,
    "hideReactionsCount": false,
    "hideSocialActivityCounts": false,
    "hideShareAction": false,
    "hideSendAction": false,
    "hideRepostsCount": false,
    "hideViewsCount": false,
    "hideReactAction": false,
    "hideCommentAction": false,
    "shareUrl": "https://www.linkedin.com/posts/williamhgates_endpolio-globalhealth-activity-7319399301971943425-6S3H?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAEv_LPcBziubM3KuMdS8HJ_FpZ-4kRH3Hz8",
    "showContributionExperience": false,
    "showSocialDetail": true
  },
  "repost": {
    "id": "7314358712113025024",
    "content": "What does it take to overcome life’s toughest challenges?\n\nFor Safia Ibrahim, a polio survivor and global health advocate, it’s resilience, hope, and storytelling.\n\nShe shared her powerful story with the world from The Moth stage as part of a Gates Foundation event. Now, she joins us to reflect on her journey and the role of storytelling in global health advocacy.\n\nListen to this inspiring conversation 🎧 on.rotary.org/moth-pod\n\n#EndPolio #GlobalHealth",
    "title": null,
    "subtitle": null,
    "link": null,
    "linkLabel": null,
    "description": null,
    "authorUniversalName": "rotary-international",
    "authorPublicIdentifier": null,
    "authorType": "company",
    "authorName": "Rotary International",
    "authorLinkedinUrl": "https://www.linkedin.com/company/rotary-international/posts",
    "authorInfo": "283,369 followers",
    "authorWebsite": null,
    "authorWebsiteLabel": null,
    "authorAvatar": {
      "url": "https://media.licdn.com/dms/image/v2/C4E0BAQFckn4J8pboCw/company-logo_400_400/company-logo_400_400/0/1630566773837/rotary_international_logo?e=1750896000&v=beta&t=IqU9H3PtakBbPeHG_61tRqYACDDkEZbi1284b3Eq3QQ",
      "width": 400,
      "height": 400,
      "expiresAt": 1750896000000
    },
    "postedAgo": "2w",
    "postImage": null,
    "postImages": [],
    "postVideo": {
      "thumbnailUrl": "https://media.licdn.com/dms/image/v2/D5610AQEpn8L3f8DLdQ/ads-video-thumbnail_720_1280/B56ZYHSdN6HoAc-/0/1743879005323?e=1746140400&v=beta&t=OZystFi8LJCngsBKYogebdPDO2eu5fxXABSLjL2og-M",
      "videoUrl": "https://dms.licdn.com/playlist/vid/v2/D5610AQEpn8L3f8DLdQ/mp4-720p-30fp-crf28/B56ZYHSdN6HoBw-/0/1743879009948?e=1746140400&v=beta&t=13-hIpkc6Z5qM0YJLTss2FbSeawWxdi8b0chf5GjPZk"
    },
    "repostId": null,
    "newsletterUrl": null,
    "newsletterTitle": null,
    "socialContent": {
      "hideCommentsCount": false,
      "hideReactionsCount": false,
      "hideSocialActivityCounts": false,
      "hideShareAction": false,
      "hideSendAction": false,
      "hideRepostsCount": false,
      "hideViewsCount": false,
      "hideReactAction": false,
      "hideCommentAction": false,
      "shareUrl": "https://www.linkedin.com/posts/rotary-international_endpolio-globalhealth-activity-7314358712113025024-67yZ?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAEv_LPcBziubM3KuMdS8HJ_FpZ-4kRH3Hz8",
      "showContributionExperience": false,
      "showSocialDetail": true
    },
    "engagement": null
  },
  "engagement": {
    "likes": 1563,
    "comments": 400,
    "shares": 81,
    "reactions": [
      {
        "type": "LIKE",
        "count": 1363
      },
      {
        "type": "EMPATHY",
        "count": 86
      },
      {
        "type": "PRAISE",
        "count": 59
      },
      {
        "type": "APPRECIATION",
        "count": 40
      },
      {
        "type": "INTEREST",
        "count": 11
      },
      {
        "type": "ENTERTAINMENT",
        "count": 4
      }
    ]
  }
}
```

## Linkedin profiles API

The actor stores results in a dataset. You can export data in various formats such as CSV, JSON, XLS, etc. You can scrape and access data on demand using API.

### Support and Feedback

We continuously enhance our tools based on user feedback. If you encounter technical issues or have suggestions for improvement:

- Create an issue on the actor’s Issues tab in Apify Console
- Contacts us at contact@harvest-api.com
