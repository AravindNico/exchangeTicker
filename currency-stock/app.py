from pubnub import Pubnub
from threading import Thread
import sys
import ast
from random import randint,choice,uniform
import time
import numpy as np

pub_key = "pub-c-913ab39c-d613-44b3-8622-2e56b8f5ea6d"
sub_key = "sub-c-8ad89b4e-a95e-11e5-a65d-02ee2ddab7fe"

sign = ['+','-']


def init():
	#Pubnub Key Initialization
	global pubnub 
	pubnub = Pubnub(publish_key=pub_key,subscribe_key=sub_key)
	pubnub.subscribe(channels='exchangedata', callback=newcallback, error=newcallback,
					connect=connect, reconnect=reconnect, disconnect=disconnect)

def newcallback(message, channel):
	arr = []
	arr = np.random.randint(100,200,size=30)
	arr2 = []
	for i in arr:
		arr2.append(i)
	new = dict()
	if(type(message) == unicode):
		new = ast.literal_eval(message)
	if(new.has_key('name') and new['name'] == "EUR" and not new.has_key("type")):
		pubnub.publish(channel=new["channel"],message={"name":"EUR","value":arr2,"change":choice(sign)+str("%.2f" % uniform(10.56,25.35)),"time":1412322567})
	elif(new.has_key('name') and new['name'] == "AUD" and not new.has_key("type")):
		pubnub.publish(channel=new["channel"],message={"name":"AUD","value":arr2,"change":choice(sign)+str("%.2f" % uniform(10.56,25.35)),"time":1412322567})
	elif(new.has_key('name') and new['name'] == "CYN" and not new.has_key("type")):
		pubnub.publish(channel=new["channel"],message={"name":"CYN","value":arr2,"change":choice(sign)+str("%.2f" % uniform(10.56,25.35)),"time":1412322567})
	elif(new.has_key('name') and new['name'] == "INR" and not new.has_key("type")):
		pubnub.publish(channel=new["channel"],message={"name":"INR","value":arr2,"change":choice(sign)+str("%.2f" % uniform(10.56,25.35)),"time":1412322567})
	# elif(new.has_key('name') and new.has_key("type")):
	# 	pubnub.publish(channel='exchangedata',message={"name":new["name"],"value":"345.25","change":choice(sign)+str("%.2f" % uniform(10.56,25.35)),"time":"1412322567"})

def dataHandling():
	pubnub.publish(channel='exchangedata',message={"name":"EUR","value":randint(100,200),"change":choice(sign)+str("%.2f" % uniform(10.56,25.35)),"time":1412322567})
	pubnub.publish(channel='exchangedata',message={"name":"AUD","value":randint(100,200),"change":choice(sign)+str("%.2f" % uniform(10.56,25.35)),"time":1412322567})
	pubnub.publish(channel='exchangedata',message={"name":"CYN","value":randint(100,200),"change":choice(sign)+str("%.2f" % uniform(10.56,25.35)),"time":1412322567})
	pubnub.publish(channel='exchangedata',message={"name":"INR","value":randint(100,200),"change":choice(sign)+str("%.2f" % uniform(10.56,25.35)),"time":1412322567})
	# time.sleep(1000)

def error(message):
    print("ERROR : " + str(message))
  
def connect(message):
    print "CONNECTED"
  
def reconnect(message):
	print("RECONNECTED")
  
def disconnect(message):
	print("DISCONNECTED")

if __name__ == '__main__':
	init()
	while True:
		t1 = Thread(target=dataHandling)
		t1.start()
		t1.join()