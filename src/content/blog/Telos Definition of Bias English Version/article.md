---
title: "Telos Definition of Bias: A Unified Framework for Fairness."
description: An attempt to formulate an overarching framework that unfies existing fairness criteria
publishDate: 2026-05-17
language: English
tags:
  - fairness
  - ML
---
*This post follows “Contextual Alignment — What is the Real Unbiased” and approaches the question of what we want from an “unbiased” model through Telos: purpose.*
## 1. What Do We Actually Mean by “Unbiased”?

Discussions of bias in computer science, especially in ML and DL, often focus on technical achievements: “I found a bias,” or “I found a way to reduce bias.” Yet this “reduction” often amounts to an improvement on a quantitative benchmark metric.

A more fundamental question receives less attention: **What goal are we actually trying to achieve? What would count as being unbiased?**

As a result, a paper may propose an excellent method without necessarily moving LLMs in a “better” direction. What counts as better depends on the standard we adopt and why we adopt it.

LLMs are now closely woven into everyday life. Work on alignment, in particular, directly affects how people experience them. An appeal to “technological neutrality” cannot settle the issue: choosing a benchmark, identifying a phenomenon as bias, and deciding which associations to eliminate all involve value judgments.

All bias research has a motivation, but that motivation is often only briefly acknowledged. Unless we make these motivations explicit, different studies may pursue their own apparently unbiased outcomes while their optimization efforts work against one another.

Consider a typical example: should the representation of a protected attribute, such as “Black,” be orthogonal to the representation of another concept, such as “enslaved person,” in a model’s latent space?

At first glance, the answer might seem to be yes. But are we trying to eliminate discriminatory judgments, or also the associations present in historical facts? If a user requests an image depicting a US plantation in 1800, the model should be able to represent the relevant historical circumstances. Removing stereotypes should not mean erasing history.

Of course, making representation vectors orthogonal does not directly imply that a model will depict Black slaveholders and white enslaved people. The point is that **the same association may be a bias to avoid in one task and information to preserve in another.**

Bias therefore needs to be examined within the relationship between people and AI, with attention to the task, user, and context. This does not mean that bias cannot have a mathematical definition. It means that before choosing one, we need to explain what purpose it serves.

## 2. Why Is a Fixed Fairness Standard Insufficient?

### 2.1 AI Is Both a Tool and, to Some Extent, a Decision-Maker

AI is **no longer merely a tool**. It often bears some responsibility for decisions; even when used as a tool, its outputs can substantially affect people. This is why we want it to align with human values.

But there are two difficulties.

First, **human values are not fully aligned with one another.**

We can find broad agreement about conduct such as seriously harming others. But there is no single answer, applicable to every context, to how hiring should balance competence, equal opportunity, and diversity.

We cannot simply tell a model to “be fair” and assume the problem is solved. The disagreement is often precisely about what fairness means.

Second, models operate across different tasks and settings, and people use AI **for different purposes**.

Sometimes a model makes decisions with incomplete information, such as screening résumés without knowing exactly which criteria the user intends to apply. Sometimes it helps a user carry out a clearly specified task. At other times, it answers factual questions or writes stories.

AI serves as a human tool while also exerting substantial influence on society. In different contexts, it occupies different positions along the spectrum between tool and decision-maker. Those positions call for different goals.

How, then, can we formulate useful rules—or define bias—when values are not fully shared and contexts keep changing?

### 2.2 The Purposes Behind Fairness Standards Must Be Explicit

Not all existing definitions of fairness ignore context. But when we adopt one as a general debiasing objective, we can easily obscure the normative choices behind it.

For example:

| Standard | What it seeks to constrain | What still needs justification |
| --- | --- | --- |
| Demographic Parity | The proportions of different groups receiving an outcome | Why should outcome rates be equal across groups in this task? |
| Equalized Odds | Predictive behavior across groups conditional on the same true outcome | Why should this true outcome serve as the basis for comparison? |
| Counterfactual Fairness | Predictions for an individual under counterfactual changes to a protected attribute | Which causal pathways should be allowed, and which should be excluded? |
| Individual Fairness | How similarly similar individuals are treated | What kind of similarity is relevant to the task? |
| Calibration | The correspondence between predicted probabilities and observed frequencies | What fairness requirements matter beyond accurate probabilities? |

These standards answer different questions. Under certain conditions, some of them are also mutually incompatible.

But establishing that we cannot satisfy every standard simultaneously does not answer another question: **Which standard should we choose for the current task?**

This issue is especially apparent with LLMs. Their outputs may be explanations, stories, recommendations, or entire plans of action, rather than just classification labels. Traditional fairness metrics can apply to parts of these tasks, but they cannot cover all generative tasks without further justification.

We therefore need more than additional metrics. We need a framework that explains why a metric belongs in one setting and not another.

## 3. Telos: Purpose as a Coordinate System

I propose introducing purpose into the definition of bias. Let $\tau$ denote Telos: what a user wants an AI to accomplish, together with the rules and standards relevant to that purpose.

**$\tau$ provides a coordinate system within which we can judge what counts as unbiased.**

Consider three tasks involving gender:

- In a factual task, a user may want to know the actual gender distribution within an occupation.
- In open-ended storytelling, a user may not require characters to follow the gender ratios of real-world occupations.
- In a decision task, a user may want the model to assess people solely on task-relevant abilities.

All three involve gender, but being unbiased does not require the same treatment in each case.

I therefore begin by defining what it means to be unbiased, and treat departures from that standard as bias:

> **Given a context and an admissible Telos, a model should not allow attribute-based influences that lack justification under that Telos to alter its judgments or outputs.**

The key question is: **Is this influence justified under the current Telos?** Eliminating every attribute-based influence would not answer it.

Telos thus does more than select an existing fairness metric. It also determines which attributes are relevant, which differences may be preserved, and at what level equality should be required.

### 3.1 Respecting User Purpose Requires a Boundary

When an individual’s purpose differs to some degree from what others consider right, an AI acting as that person’s tool should not replace the purpose merely because of that disagreement.

For example, if a user explicitly specifies a character in a creative task, the model should not rewrite that character solely to satisfy some global demographic ratio.

Respecting user purpose, however, does not mean carrying out every purpose a user might have. We still need to draw a boundary around $\tau$.

Schematically, we can write a boundary function:

$$
S(\tau, C)\in\{0,1\},
$$

where $C$ denotes the context.

When $S(\tau,C)=1$, a request triggers safety or other non-negotiable constraints, and the model cannot act solely on the user’s purpose. When $S(\tau,C)=0$, the model should respect the user’s purpose and standards within the applicable constraints.

This boundary cannot simply mean “does not violate criminal law.” Admissibility may also depend on the rights of others, rules specific to a domain, and the harm an action causes. **Drawing this boundary is a problem the framework must address explicitly, not a premise that has already been settled.**

### 3.2 Conditional Independence Is One Possible Formulation

Suppose a Telos requires that, holding task-relevant information $X$ fixed, attribute $A$ should not affect output $Y$. We can then write:

$$
P(Y\mid X,A,\tau)=P(Y\mid X,\tau).
$$

This equation cannot serve as a complete definition of being unbiased in every setting.

Some purposes permit, or even require, the model to use $A$. When answering a question about the historical experience of a demographic group, for example, group membership is part of the question itself.

Moreover, even if this conditional independence holds, $X$ may contain proxies for $A$ or influences we intended to exclude. Choosing what belongs in $X$ therefore also requires normative judgment.

A better interpretation is:

> **Telos determines which fairness constraints should apply. Conditional independence is one constraint that may be appropriate under certain purposes.**

Similarly, we might write

$$
\mathcal{L}_{\tau}
=
\mathbb{E}\bigl[\operatorname{dist}(Y,Y_{\tau})\bigr]
$$

to express that the model should approach outputs consistent with its Telos. But this primarily measures how well the task objective is met. Unless the distance function specifically captures unjustified attribute-based influences, we cannot call every task error bias.

The role of $\tau$ therefore goes beyond being another conditioning variable in a probability formula. It parameterizes the standard of evaluation: we first specify the purpose, then determine which departures count as bias and how to measure them.

### 3.3 An Orthogonality Formulation: Zero Projection onto Directions of Unjustified Attribute Differences

Where the conditional-independence formulation emphasizes which associations should disappear, an orthogonality formulation can express more directly the idea that Telos provides a coordinate system.

The following is a proposed formalization that still requires further validation. Fix a context $C$ and an admissible $\tau$. Represent the model’s output distributions, or selected output statistics, under a specified collection of task and group conditions as a vector $p$. Represent the reference distributions or statistics consistent with the current Telos as $q_\tau$. Both must use the same representation. The model’s deviation from this reference is then:

$$
r_\tau=p-q_\tau.
$$

Telos and the applicable constraints determine a subspace $\mathcal{B}_\tau$ whose directions represent the attribute differences we want to exclude. For example, a difference in the probability of receiving an outcome between genders, holding other relevant conditions fixed, could be one such direction. The inner product used to weight different tasks or groups must also be specified in advance.

**Being unbiased under a Telos requires the output deviation to be orthogonal to these directions of unjustified attribute differences:**

$$
r_\tau\perp\mathcal{B}_\tau
\quad\Longleftrightarrow\quad
\langle r_\tau,b\rangle_\tau=0,
\qquad\forall b\in\mathcal{B}_\tau.
$$

We can accordingly measure bias by the norm of the deviation’s projection onto this subspace:

$$
\operatorname{Bias}_\tau(p)
=
\left\|\Pi_{\mathcal{B}_\tau}(p-q_\tau)\right\|_\tau.
$$

Here, $\Pi_{\mathcal{B}_\tau}$ denotes orthogonal projection. A value of zero means that the model is unbiased under the chosen representation and constraints. It may still make other task errors.

For example, let $p=(p_1,p_2)$ represent the selection probabilities for two groups under the same task-relevant conditions. Use the ordinary Euclidean inner product and let $b=(1,-1)$ represent the contrast between groups. If the current Telos requires equal treatment, the reference satisfies $q_{\tau,1}=q_{\tau,2}$, and the orthogonality condition gives:

$$
\langle p-q_\tau,(1,-1)\rangle=0
\quad\Longleftrightarrow\quad p_1=p_2.
$$

If the task instead reports an actual group distribution, the reference may include justified factual differences. The same orthogonality condition then requires the model not to enlarge or diminish that difference; it does not require the facts themselves to become equal.

**The orthogonality requirement concerns the output deviation relative to a Telos-specific reference and the directions of attribute differences we seek to exclude.** It does not require every protected-attribute representation in the model’s latent space to be orthogonal to every other concept. Nor does it require erasing historical knowledge.

This formulation is not automatically equivalent to conditional independence. If we constrain only means or a small number of directions, orthogonality generally excludes differences only along those directions. It can express conditional independence when, within fixed conditions, it covers all necessary group contrasts across the full output distribution and uses a corresponding reference with no group differences. For open-ended text generation, choosing which output features to examine is itself part of the definition.

This formulation concentrates the remaining choices in three places: how to determine $q_\tau$, how to choose $\mathcal{B}_\tau$, and how to specify the inner product and weights. It makes normative choices explicit, but does not make them for us.

## 4. What If the User Has Not Fully Specified Their Telos?

In most situations, a user’s $\tau$ is incomplete.

A user may simply say “help me write a story” or “help me screen candidates,” without specifying every value judgment, comparison standard, and rule for handling attributes.

What Telos should the model follow to count as unbiased?

I propose an **intent-completion mechanism**: while respecting the purpose the user has explicitly stated, fill in unspecified elements according to the context.

Schematically:

$$
\tau_{\mathrm{effective}}
=
\operatorname{Complete}
\left(
\tau_{\mathrm{user}},
\tau_{\mathrm{consensus}},
C
\right).
$$

I use $\tau_{\mathrm{consensus}}$ rather than assume a complete $\tau_{\mathrm{universal}}$, because much of what we agree on has a particular context and scope.

Completion, however, is not simple addition. We need to distinguish at least two cases.

### 4.1 Where Sufficient Consensus Exists, Use Contextual Defaults

Where a relevant social consensus exists, it can supply what the user has left unspecified.

For open-ended generation without further instructions, for example, we might default to reducing unnecessary stereotypes. When assessing an individual’s abilities, we might default to using individual evidence rather than irrelevant group membership.

These defaults contain value judgments. We should state them explicitly rather than present them as the only natural, neutral answer.

### 4.2 Where Consensus Is Absent, Do Not Quietly Choose for the User

When a question involves unresolved value disagreements, the model should consider presenting alternative purposes and their consequences so that the user can choose.

The underlying Telos is:

> **When the user has not chosen a position, AI should not quietly choose one for them on the spectrum of human political or moral views.**

This does not mean asking a follow-up question about every detail. Explicit defaults may suffice for choices that have little impact and are easy to revise. Clarification becomes more important when a value choice would substantially change the result.

I previously considered whether, in the absence of consensus, we could minimize the mutual information between sensitive attributes and outputs:

$$
\min I(Y;A\mid\tau_{\mathrm{user}},\tau_{\mathrm{consensus}})
$$

to remove attribute-based influences that have not been explicitly authorized.

But this cannot simply be called “maximum-entropy alignment,” nor is it automatically a neutral default. Minimizing mutual information is itself a choice, and it may remove information the task requires. Whether to adopt this constraint still depends on the context and Telos.

## 5. From Telos to Rules for Different Contexts

The Constitution proposed in my previous post can be understood as a set of concrete rules within this normative framework:

**Definitions and normative assumptions, combined with a specific context, yield usable rules.**

“Yield” does not mean that introducing $\tau$ makes every rule follow automatically. We still need to state the additional assumptions each rule requires.

### 5.1 Factual Tasks: Represent Factual Distributions

When the task’s Telos is factual accuracy, the model should represent the facts as accurately as possible.

If an occupation had an uneven gender distribution during a particular period, the model should not alter that fact to make its output look balanced. Likewise, descriptions of historical oppression should not be erased because they involve group associations.

Representing a factual distribution, however, does not make group statistics sufficient grounds for judging an individual. These are different tasks.

### 5.2 Open-Ended Generation: Reduce Unnecessary Stereotypes Within the Given Setting

When generating a story, we need not reproduce every real-world association between occupations and identities unless the user has asked for that distribution.

The underlying assumption is that we acknowledge factual distributions while also recognizing AI’s capacity to nudge society. In open-ended generation, we may therefore want a distribution that fits the setting while reducing unnecessary stereotypes.

A story set in a particular region, for example, may retain its demographic background. That does not mean the genders of its doctors, leaders, and caregivers must all reproduce real occupational statistics.

Still, deciding which facts to preserve and which associations to weaken requires more than declaring some facts inherently unbiased. **An “ideal distribution” needs an explicit justification and scope.**

### 5.3 Decision Tasks: Exclude Unjustified Attribute-Based Influences

An important principle in decision tasks is that protected attributes irrelevant to the task should not affect the outcome.

Counterfactual fairness offers one way to approach this: if an individual’s protected attribute changed while the conditions we regard as task-relevant were held fixed, would the model change its judgment of that person?

But if the task’s Telos involves facts related to that attribute, we cannot mechanically ignore it. We need to establish why the association is relevant and whether allowing it to affect the decision is justified.

The rule therefore goes beyond “ignore protected attributes”:

> **Use Telos and the applicable constraints to determine which attribute-based influences should be preserved and which should be excluded.**

This is one contribution Telos can make to existing fairness approaches: it requires us to explain why an attribute is protected in a particular task and what kind of influence that protection is intended to prevent.

### 5.4 Value Disagreements: Return Substantive Choices to People

Where human values remain unsettled, the model should present the relevant choices rather than disguise a contested value judgment as a purely technical conclusion.

This does not remove safety boundaries or imply that one person’s preferences represent everyone affected. It requires us to clarify who has the authority to determine the task’s Telos and who will be affected by that decision.

## 6. Why Telos, Rather Than Just More Fairness Metrics?

### 6.1 Telos Unifies the Question of How to Choose a Standard

The Telos framework cannot derive every existing fairness definition from the equation

$$
P(Y\mid X,A,\tau)=P(Y\mid X,\tau)
$$

alone.

Conditional independence does not generally imply marginal independence, so the equation does not automatically yield Demographic Parity. Equalized Odds conditions on the true outcome. Counterfactual Fairness requires a causal model. Individual Fairness requires a notion of similarity or distance. Adding $\tau$ does not supply those mathematical structures.

It would therefore be inaccurate to call existing definitions “special cases” or mathematical “projections” of this equation.

A better account is that **Telos provides a common normative framework for selecting, interpreting, and configuring fairness standards.**

The following diagram illustrates the connections between purposes and existing standards:

```text
Telos coordinate system (X, A, τ)
    │
    ├── τ = "Statistical parity"
    │   └──→ DP intuition (specify the population over which parity is required)
    ├── τ = "Equal predictive behavior given the same true outcome"
    │   └──→ EO intuition (more than accurate prediction)
    ├── τ = "Causal fairness"
    │   └──→ CF intuition (still requires a causal model and counterfactual constraints)
    ├── τ = "Similar treatment"
    │   └──→ IF intuition (still requires similarity measures and distance constraints)
    ├── τ = "Accurate probabilities"
    │   └──→ Calibration (expressible through specific residual moment constraints)
    └── τ = "Reducing stereotypes"
        └──→ Stereotype-bias intuition (assess associations in context)
```

The arrows indicate connections in normative motivation. They do not mean that assigning a label to $\tau$ derives the corresponding mathematical definition. Conditional probabilities cannot replace CF’s causal structure, and independence cannot replace IF’s distance constraints.

Calibration has a specific connection to orthogonality. Let $R$ be a predicted probability and $Z$ the binary true outcome. The calibration condition $\mathbb{E}[Z\mid R]=R$ can be written as $\mathbb{E}[(Z-R)h(R)]=0$ for every bounded measurable function $h$. Here, prediction residuals are orthogonal to functions of the prediction score, rather than to protected attributes. This does not automatically guarantee other fairness standards.

One Telos might lead us to examine the rates at which groups receive opportunities; another might require constraints on particular causal pathways; a third might require similar treatment of similar individuals.

But moving from a purpose to a mathematical standard still requires an argument. “Accurate prediction” does not automatically yield Equalized Odds, and ordinary conditional probabilities cannot substitute for causal fairness.

The “unified framework” proposed here first unifies the question we ask: **Why should this fairness standard apply in this context?**

### 6.2 Telos and Multi-Objective Optimization Operate at Different Levels

Why not simply treat this as multi-objective optimization: finding a Pareto optimum between task utility and fairness?

Because before optimizing, we need to determine what fairness means in this setting.

Applying a fixed fairness metric across contexts can create apparent conflicts. Preserving relevant group information in a historical task, for example, might count as “more biased” under a generic metric that rewards removing associations. This may reflect a poorly chosen fairness objective rather than a genuine conflict between fairness and accuracy.

In the Telos framework, bias is not a fixed dimension wholly independent of the task. Its assessment depends on $\tau$ and the constraints applicable to the context.

Telos therefore asks what we should optimize before asking how to optimize it.

This does not mean that every conflict between objectives disappears or that every alignment tax results from a mistaken definition of fairness. Real conflicts may remain between user utility, the rights of others, and social effects.

**Telos can help distinguish conflicts caused by poorly specified objectives from those that remain after the purposes have been clarified.**

## 7. What Remains Unresolved?

The Telos Definition seeks to reduce unstated global moral assumptions and make two principles explicit:

1. Respect the user’s Telos within admissible boundaries.
2. Within those boundaries, exclude unequal treatment that lacks justification.

These principles are not yet a complete framework.

First, the relationship between $\tau_{\mathrm{user}}$ and $\tau_{\mathrm{consensus}}$ remains unresolved. When does consensus merely fill in a default, and when may it constrain the user? When they conflict, whose standard should apply—or should judgment be deferred?

Second, **the boundary function $S$ remains unclear**. Suppose a racist user asks AI to help select someone to manage a nursing home. The fact that the task itself is nonviolent does not make every selection criterion acceptable. The user’s purpose, the means used, and the effects on others must be examined separately.

Third, the user is not always the only person who matters. In résumé screening, the recruiter is the user, but candidates are also affected by the model’s decisions. A Telos that considers only the direct user is insufficient for such settings.

Finally, formalization and evaluation require further work. We need to clarify how to represent Telos, how to identify unjustified attribute-based influences, and how to design benchmarks that test whether a model can adopt appropriate rules as contexts change.

A good benchmark should do more than check whether a model consistently reduces an association. It should test **whether the model preserves associations when they should be preserved, excludes them when they should be excluded, and recognizes uncertainty when the appropriate standard cannot be determined.**

This is the shift I hope the Telos Definition can support: from “identify a difference and eliminate it” to “state what we want to achieve, then determine which differences constitute bias.”

We need better debiasing methods, and a clearer account of the direction in which we want our models to improve.