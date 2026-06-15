from django.test import TestCase
from apps.taxonomy.models import Skills, Locations

class TaxonomyTests(TestCase):
    def test_skills_creation(self):
        skill = Skills.objects.create(name="Python", category="Technology", description="Programming Language", is_active=True)
        self.assertEqual(skill.name, "Python")
        self.assertEqual(skill.category, "Technology")
        self.assertTrue(skill.is_active)

    def test_locations_creation(self):
        location = Locations.objects.create(city="San Francisco", state="CA", country="USA", is_active=True)
        self.assertEqual(location.city, "San Francisco")
        self.assertEqual(location.country, "USA")
