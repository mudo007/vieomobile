# viedeomobile
This is an example app with the purpose of learning and practicing React Native with Expo using DDD and TDD. It is a simple app with 2 independent modes "creator" and "follower". No login screens required. They will share the same database for this demonstration, so that the follower part of the app can see what the creator side of the app creted.
I will also add automatic OTA updates through expo, with small cosmetic changes, such as changing a background color 

## Modeling
Let's first create te ubiquitous language for tis domain
- a  **Creator** uploads a **Video** from his **Phone Library** into his **Gallery**
- a  **Creator** browses uploaded **Video** from his **Gallery**, **haptics** on success
- a **Follower** sees uploaded **Video**s from the **Creator** on his **Feed** as **Cards**
- a **OTA update** triggers a change on the **Background Color**

## Flows
- **Creator** uploads a **Video**: Opens app -> taps **Creator** -> taps Create -> picks video from library -> adds title -> confirms -> sees upload progress -> lands back on **Galery** with their post at top.
- **Follower** discovers a **Video**: Opens app -> taps **Follower** ->scrolls **Feed** -> taps a **Card** -> **Video** plays full screen -> taps back -> continues scrolling the **Feed**.
- Aan **OTA update** arrives silently: opens app -> OTA check runs in background -> updated JS bundle loads -> user sees new **Background Color** without visiting the store. (any screen)


## States
| State | Home | Feed | Gallery | Player
|---|---|---|---|---|
| Loading | Personas Loading | Feed loading | Uploading | Buffering |
| idle | N/A | Empty Feed | Ready to create | Video Paused |
| active | Personas choice | Cards loaded| Video picked | Now Playing |
| error | Persona Error | Feed Error | Create Error | Player Error |

# Milestones

## Infrastrucutre
- Download frameworks and dependencies, I am  using a macbook pro M4 and an Iphone 16 Plus for testing if needed. Preferably use only Docker so that nothing gets installed on the local machine. I have done this type of setup a long time go see the repo https://github.com/mudo007/NLW-spacetime/tree/main

## App logic
On this staage, we will use defaut library visual components, and we will care only about "business logic" created with TDD.

### Walking skeleton
- Components tree
- Scaffold Expo Router project with Typescript

### Persona screen
- Create persona cards component 
- Create state transitions
    - Home screen-> Taps Creator -> Change to Gallery Screen
    - Home screen-> Taps Follower -> Change to Feed Screen

### Gallery Screen
- Create upload video Form
- Create gallery picker
- Create video card
- Create state transitions
    - Gallery -> back button -> Home screen
    - Gallery -> Upload Video -> Video Picker 
    - Video Picker -> back button -> Gallery
    - Video Picker -> select single video -> confirm button -> Uploading
    - Video Picker -> select single video -> play -> Video Player
    - Video Player -> back button -> Video Picker
    - Video Player -> pause button  -> Video Paused
    - Video Player -> play button -> Video Buffering /Playing
    - Video Picker -> select single video -> back buttom -> Gallery
    - Uploading -> time passes -> upload sucessful card -> Gallery
    - Uploading -> time passes -> upload error card -> Gallery
    - Uploading -> cancel button -> Video Picker

### Feed Screen
- Create Feed view form
- *reuse Video Card and Video Player from Gallery*
- Create Refresh component
- Create loading feed component
- Create state transitions
    - Feed -> back button -> Home screen
    - Feed -> refresh button -> Feed loading -> Feed
    - Feed -> video card -> Video player
    - *reuse Video plaeyr states except for*:
    - Video Player -> back button -> Feed

### OTA background
- Create OTA boilerplate
- State transition
    - Any screen -> OTA arrives -> Background color changes






