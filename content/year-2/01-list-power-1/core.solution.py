scores = [55, 90, 72, 90, 18]
ranked = sorted(scores, reverse=True)
top_three = ranked[:3]
print("Top three:", top_three)
print("Original order:", scores)
