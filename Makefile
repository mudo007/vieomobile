launch:
	xcrun simctl launch booted com.mudo007.videomobileexposcaffoldsdk54

terminate:
	xcrun simctl terminate booted com.mudo007.videomobileexposcaffoldsdk54

relaunch:
	xcrun simctl launch --terminate-running-process booted com.mudo007.videomobileexposcaffoldsdk54

ota-bump:
	eas update --channel preview